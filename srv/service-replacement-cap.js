const cds = require("@sap/cds");
const LOG = cds.log("service-replacement-cap");

const { getServiceBindingForTenantId } = require("./service-manager");

async function fillServiceReplacementCAP(req) {
  if (req.data.tenant !== "t0") {
    // Get environment variable
    const vcap = JSON.parse(process.env.VCAP_SERVICES);
    let upsName = "";
    let tenantId = "";

    if (req.data.metadata) {
      // for SaasProvisioningService
      upsName = req.data.metadata.subscribedSubdomain + "_BOOKSHOP";
      tenantId = req.data.metadata.subscribedTenantId;
    } else {
      // for CAP deployment service (/-/cds/deployment/subscribe)
      upsName = req.data.tenant + "_BOOKSHOP";
      tenantId = req.data.tenant;
    }
    LOG.info("Searching for upsName", upsName);
    LOG.info("tenantId", tenantId);
    // Check if UPS is existing in vcap
    // to be able to test without access to the cf-api
    let upsContent = vcap["user-provided"]?.filter((ups) => {
      ups.name === upsName;
    });
    if (upsContent === undefined || upsContent.length === 0) {
      // Use Service Manager to read details of UPS
      const serviceBinding = await getServiceBindingForTenantId(tenantId);
      LOG.info(
        "serviceBinding - instance_name",
        serviceBinding.context.instance_name
      );
      LOG.info(
        "serviceBinding - credentials - schema",
        serviceBinding.credentials.schema
      );

      // Fill the user provided service with the credentials
      upsContent = {
        label: "user-provided",
        name: upsName,
        tags: ["hana"],
        instance_guid: serviceBinding.id,
        instance_name: upsName,
        binding_name: null,
        credentials: serviceBinding.credentials,
        syslog_drain_url: null,
        volume_mounts: [],
      };
      if (vcap["user-provided"] === undefined) {
        vcap["user-provided"] = [];
      }
      // add it to vcap
      vcap["user-provided"].push(upsContent);
      // set env variable VCAP_SERVICES
      process.env.VCAP_SERVICES = JSON.stringify(vcap);
    }
    process.env.SERVICE_REPLACEMENTS = JSON.stringify([
      {
        key: "ServiceName_1",
        name: "cross-container-service-1",
        service: upsName,
      },
    ]);
    LOG.debug("SERVICE_REPLACEMENTS", process.env.SERVICE_REPLACEMENTS);
  }
}

module.exports = { fillServiceReplacementCAP };
