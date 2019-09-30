import { DataService } from './data.service';
import { NormalizedObjectBuildService } from '../cache/builders/normalized-object-build.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestService } from './request.service';
import { Store } from '@ngrx/store';
import { CoreState } from '../core.reducers';
import { FindAllOptions, FindByIDRequest } from './request.models';
import { Observable } from 'rxjs';
import { IdentifierType } from '../index/index.reducer';
import { RemoteData } from './remote-data';
import { DSOChangeAnalyzer } from './dso-change-analyzer.service';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { hasValue } from '../../shared/empty.util';
import { getFinishedRemoteData } from '../shared/operators';
import { Router } from '@angular/router';

@Injectable()
export class DsoDataRedirectService extends DataService<any> {

  protected linkPath = 'pid';
  protected forceBypassCache = false;

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected dataBuildService: NormalizedObjectBuildService,
    protected store: Store<CoreState>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DSOChangeAnalyzer<any>,
    private router: Router) {
    super();
  }

  getBrowseEndpoint(options: FindAllOptions = {}, linkPath: string = this.linkPath): Observable<string> {
    return this.halService.getEndpoint(linkPath);
  }

  getIDHref(endpoint, resourceID): string {
    return endpoint.replace(/\{\?id\}/,`?id=${resourceID}`);
  }

  findById(id: string, identifierType = IdentifierType.UUID): Observable<RemoteData<FindByIDRequest>> {
    return super.findById(id, identifierType).pipe(
      getFinishedRemoteData(),
      tap((response) => {
        if (response.hasSucceeded) {
          const uuid = response.payload.uuid;
          // Is there an existing method somewhere that converts dso type to endpoint?
          // This will not work for all endpoints!
          const dsoType = this.getEndpointFromDSOType(response.payload.type);
          if (hasValue(uuid) && hasValue(dsoType)) {
            this.router.navigate([dsoType + '/' + uuid]);
          }
        }
      })
    );
  }

  getEndpointFromDSOType(dsoType: string): string {
    if (dsoType.startsWith('item')) {
      return 'items'
    } else if (dsoType.startsWith('community')) {
      return 'communities';
    } else if (dsoType.startsWith('collection')) {
      return 'collections'
    } else {
      return '';
    }
  }
}
