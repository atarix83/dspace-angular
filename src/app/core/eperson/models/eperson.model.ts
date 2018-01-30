import { autoserialize } from 'cerialize';
import { CacheableObject } from '../../cache/object-cache.reducer';
import { ListableObject } from '../../../shared/object-collection/shared/listable-object.model';
import { NormalizedDSpaceObject } from '../../cache/models/normalized-dspace-object.model';
import { DSpaceObject } from '../../shared/dspace-object.model';

export class EpersonModel extends DSpaceObject implements CacheableObject, ListableObject {

  public handle: string;

  public groups: any;

  public netid: string;

  public lastActive: string;

  public canLogIn: boolean;

  public email: string;

  public requireCertificate: boolean;

  public selfRegistered: boolean;

}
