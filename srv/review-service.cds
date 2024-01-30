using {sap.capire.reviews as my} from '../db/schema';

@requires: 'authenticated-user'

service ReviewService {
  entity Reviews as projection on my.Reviews;
  entity Books   as projection on my.Books;
  function getBookshopServiceManager()                     returns String;
  function getToken()                                      returns String;
  function getServiceBindingForTenantId(tenantId : String) returns String;
}
