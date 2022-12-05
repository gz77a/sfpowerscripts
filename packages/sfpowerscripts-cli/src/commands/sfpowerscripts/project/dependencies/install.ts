import { ConsoleLogger } from '@dxatscale/sfp-logger';
import SFPOrg from '@dxatscale/sfpowerscripts.core/lib/org/SFPOrg';
import { flags } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import SfpowerscriptsCommand from '../../../../SfpowerscriptsCommand';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@dxatscale/sfpowerscripts', 'project_dependencies_install');

export default class Install extends SfpowerscriptsCommand {
    public static description = messages.getMessage('commandDescription');

    public static examples = [`$ sfdx sfpowerscripts:releasedefinition:generate -n <releaseName>`];

    protected static requiresProject = true;
    protected static requiresDevhubUsername = false;

    protected static flagsConfig = {
        individualpackage: flags.string({
            char: 'p',
            required: false,
            description: 'Installs a specific package especially for upgrade scenario',
        }),
        installationkeys: flags.string({
            char: 'k',
            required: false,
            description:
                'installation key for key-protected packages (format is packagename:key --> core:key nCino:key vlocity:key to allow some packages without installation key)',
        }),
        branch: flags.string({
            char: 'b',
            required: false,
            description:
                'the package version’s branch (format is packagename:branchname --> core:branchname consumer:branchname packageN:branchname)',
        }),
        tag: flags.string({
            char: 't',
            required: false,
            description: 'the package version’s tag (format is packagename:tag --> core:tag consumer:tag packageN:tag)',
        }),
        wait: flags.string({
            char: 'w',
            required: false,
            description: 'number of minutes to wait for installation status (also used for publishwait). Default is 10',
        }),
        noprompt: flags.boolean({
            char: 'r',
            required: false,
            description:
                'allow Remote Site Settings and Content Security Policy websites to send or receive data without confirmation',
        }),
        updateall: flags.boolean({
            char: 'o',
            required: false,
            description: 'update all packages even if they are installed in the target org',
        }),
        apexcompileonlypackage: flags.boolean({
            char: 'a',
            required: false,
            description:
                'compile the apex only in the package, by default only the compilation of the apex in the entire org is triggered',
        }),
        usedependencyvalidatedpackages: flags.boolean({
            required: false,
            description: 'use dependency validated packages that matches the version number schema provide',
        }),
        filterpaths: flags.array({
            char: 'f',
            required: false,
            description:
                'in a mono repo project, filter packageDirectories using path and install dependent packages only for the specified path',
        }),
        loglevel: flags.enum({
            description: 'logging level for this command invocation',
            default: 'info',
            required: false,
            options: [
                'trace',
                'debug',
                'info',
                'warn',
                'error',
                'fatal',
                'TRACE',
                'DEBUG',
                'INFO',
                'WARN',
                'ERROR',
                'FATAL',
            ],
        }),
    };

    async execute(): Promise<any> {
        try {
        } catch (err) {}
    }
}
