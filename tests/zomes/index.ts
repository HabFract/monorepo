import {
  orbits1,
  orbits2,
  crud,
  levels,
  prepend,
} from "./habits/personal/orbits";
import { crud as sphereCrud } from "./habits/personal/sphere";
import { crud as winRecordCrud } from "./habits/personal/win_record";

orbits1();
orbits2();
crud();
levels();

sphereCrud();
prepend();
winRecordCrud();
