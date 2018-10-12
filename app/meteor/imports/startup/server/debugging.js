import Appdynamics from 'appdynamics'

export default () => {
  Appdynamics.profile({
    controllerHostName: 'dali201810111248169.saas.appdynamics.com',
    controllerPort: 443,
    controllerSslEnabled: true,
    accountName: 'dali201810111248169',
    accountAccessKey: 'xgpo1pb984va',
    applicationName: 'Rosalind',
    tierName: 'Webapp',
    nodeName: 'process'
  })
}
