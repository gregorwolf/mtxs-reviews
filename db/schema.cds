using {
  cuid,
  managed
} from '@sap/cds/common';

namespace sap.capire.reviews;

// Reviewed subjects can be any entity that is uniquely identified
// by a single key element such as a UUID
type ReviewedSubject : String(111);

entity Reviews : cuid, managed {
  subject : ReviewedSubject;
  rating  : Rating;
  title   : String(111);
  text    : String(1111);
}

type Rating          : Integer enum {
  Best  = 5;
  Good  = 4;
  Avg   = 3;
  Poor  = 2;
  Worst = 1;
}
