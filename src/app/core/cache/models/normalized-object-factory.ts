import { NormalizedBitstream } from './normalized-bitstream.model';
import { NormalizedBundle } from './normalized-bundle.model';
import { NormalizedItem } from './normalized-item.model';
import { NormalizedCollection } from './normalized-collection.model';
import { GenericConstructor } from '../../shared/generic-constructor';
import { NormalizedCommunity } from './normalized-community.model';
import { ResourceType } from '../../shared/resource-type';
import { NormalizedObject } from './normalized-object.model';
import { NormalizedBitstreamFormat } from './normalized-bitstream-format.model';
import { NormalizedLicense } from './normalized-license.model';
import { NormalizedResourcePolicy } from './normalized-resource-policy.model';
import { NormalizedWorkspaceItem } from '../../submission/models/normalized-workspaceitem.model';
import { SubmissionDefinitionsModel } from '../../shared/config/config-submission-definitions.model';
import { EpersonModel } from '../../eperson/models/eperson.model';
import { EpersonsModel } from '../../eperson/models/epersons.model';
import { NormalizedEpersonModel } from '../../eperson/models/NormalizedEperson.model';

export class NormalizedObjectFactory {
  public static getConstructor(type: ResourceType): GenericConstructor<any> {
    switch (type) {
      case ResourceType.Bitstream: {
        return NormalizedBitstream
      }
      case ResourceType.BitstreamFormat: {
        return NormalizedBitstreamFormat
      }
      case ResourceType.Bundle: {
        return NormalizedBundle
      }
      case ResourceType.Item: {
        return NormalizedItem
      }
      case ResourceType.Collection: {
        return NormalizedCollection
      }
      case ResourceType.Community: {
        return NormalizedCommunity
      }
      case ResourceType.License: {
        return NormalizedLicense
      }
      case ResourceType.ResourcePolicy: {
        return NormalizedResourcePolicy
      }
      case ResourceType.Workspaceitem: {
        return NormalizedWorkspaceItem
      }
      case ResourceType.SubmissionDefinition: {
        return SubmissionDefinitionsModel
      }
      case ResourceType.Eperson: {
        return NormalizedEpersonModel
      }
      default: {
        return undefined;
      }
    }
  }
}
