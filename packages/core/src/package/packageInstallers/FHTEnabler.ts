import SFPLogger, { Logger, LoggerLevel } from '@dxatscale/sfp-logger';
import { ComponentSet, registry } from '@salesforce/source-deploy-retrieve';
import * as fs from 'fs-extra';
import QueryHelper from '../../queryHelper/QueryHelper';
import SfpPackage from '../SfpPackage';
import path from 'path';
import { Connection } from '@salesforce/core';

const { XMLBuilder } = require('fast-xml-parser');

const QUERY_BODY = 'SELECT QualifiedApiName, IsFieldHistoryTracked, EntityDefinitionId FROM FieldDefinition WHERE IsFieldHistoryTracked = false AND DurableId IN: ';

export default class FHTEnabler {

    public async generateFHTEnabledComponents(sfpPackage: SfpPackage, conn: Connection, logger: Logger): Promise<ComponentSet> {

        //only do if isFHTFieldFound is true
        if(!sfpPackage.isFHTFieldFound) {
            SFPLogger.log(`No FHT handling needed`, LoggerLevel.INFO, logger);
            return;
        }

        //Generate component sets
        let componentSet = ComponentSet.fromSource(path.join(sfpPackage.workingDirectory, sfpPackage.packageDirectory));
        let sourceComponents = componentSet.getSourceComponents().toArray();

        //read json to get the object names and field names
        let filePath;
        if (sfpPackage.workingDirectory != null) filePath = path.resolve(sfpPackage.workingDirectory, './postDeployTransfomations/fhtJson.json');

        if (!fs.existsSync(filePath)) {
            SFPLogger.log(`Unable to find FHT json file`, LoggerLevel.ERROR, logger);
            return;
        }

        let fhtJson = fs.readFileSync(filePath, 'utf8');
        let parsedFHTJson = JSON.parse(fhtJson);

        //extract the durableId list and object list for the query from the fht Json
        let durableIdList = [];
        let objList = [];
        Object.keys(parsedFHTJson).forEach(function(key) {
            objList.push(key);
            parsedFHTJson[key].forEach(ele => durableIdList.push(key + '.' + ele));
        });

        let query = QUERY_BODY + durableIdList;

        try {
            SFPLogger.log(`Enabling FHT In the Target Org....`, LoggerLevel.INFO, logger);
            //Fetch the custom fields in the fhtJson from the target org
            let fhtFieldsInOrg = await QueryHelper.query<{ QualifiedApiName: string; IsFieldHistoryTracked: boolean, EntityDefinitionId: string }>(query, conn, false);

            let modifiedComponentSet = new ComponentSet();

            for (const sourceComponent of sourceComponents) {
                let sourceComponentXml = sourceComponent.parseXmlSync();
                let componentMatchedByName;

                //if the current component is a field
                if (sourceComponent.type.name === registry.types.customobject.children.types.customfield.name) {

                    //check if the current source component needs to be modified
                    componentMatchedByName = fhtFieldsInOrg.find(
                        (element: CustomField) => element.QualifiedApiName == sourceComponentXml['CustomField']['name'] && element.EntityDefinitionId == sourceComponent.parent?.fullName
                    );

                    //update fht setting on the field
                    if (componentMatchedByName) {
                        sourceComponentXml['CustomField']['trackHistory'] = true;
                    }
                }

                //if the current component is an object
                if (sourceComponent.type.name === registry.types.customobject.name) {

                    //check if the current source component needs to be modified
                    componentMatchedByName = objList.find(
                        (element: string) => element === sourceComponent.fullName
                    );

                    //update fht setting on the object
                    if (componentMatchedByName) {
                        sourceComponentXml['CustomObject']['enableHistory'] = true;
                    }
                }

                //This is a deployment candidate
                if (componentMatchedByName) {
                    let builder = new XMLBuilder({
                        format: true,
                        ignoreAttributes: false,
                        attributeNamePrefix: '@_',
                    });
                    let xmlContent = builder.build(sourceComponentXml);
                    fs.writeFileSync(sourceComponent.xml, xmlContent);
                    modifiedComponentSet.add(sourceComponent);
                }
            }
            SFPLogger.log(`Completed handling FHT`, LoggerLevel.INFO, logger);
            return modifiedComponentSet;
        } catch (error) {
            SFPLogger.log(`Unable to handle FHT, returning the component set`, LoggerLevel.ERROR, logger);
            return componentSet;
        }
    }
}

interface CustomField {
    QualifiedApiName: string;
    IsFieldHistoryTracked: boolean;
    EntityDefinitionId: string;
}
