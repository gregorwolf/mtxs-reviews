using {sap.capire.reviews as my} from '../db/schema';

@requires: 'authenticated-user'

service ReviewService {
  entity Reviews as projection on my.Reviews;
}
