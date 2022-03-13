const SFPOWERSCRIPTS_DEFAULT_VALIDATE_DEPLOYMENT_OPTION = `diff`;

export default function defaultValidateDeploymentOption(): string {
    return process.env.SFPOWERSCRIPTS_DEFAULT_VALIDATE_DEPLOYMENT_OPTION
        ? process.env.SFPOWERSCRIPTS_DEFAULT_VALIDATE_DEPLOYMENT_OPTION
        : SFPOWERSCRIPTS_DEFAULT_VALIDATE_DEPLOYMENT_OPTION;
}