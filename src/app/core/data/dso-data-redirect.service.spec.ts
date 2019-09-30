import { cold, getTestScheduler } from 'jasmine-marbles';
import { TestScheduler } from 'rxjs/testing';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { FindByIDRequest } from './request.models';
import { RequestService } from './request.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { HttpClient } from '@angular/common/http';
import { NormalizedObjectBuildService } from '../cache/builders/normalized-object-build.service';
import { IdentifierType } from '../index/index.reducer';
import { DsoDataRedirectService } from './dso-data-redirect.service';
import { Store } from '@ngrx/store';
import { CoreState } from '../core.reducers';

describe('DsoDataRedirectService', () => {
  let scheduler: TestScheduler;
  let service: DsoDataRedirectService;
  let halService: HALEndpointService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;
  let objectCache: ObjectCacheService;
  let router;
  let remoteData;
  const dsoUUID = '9b4f22f4-164a-49db-8817-3316b6ee5746';
  const dsoHandle = '1234567789/22';
  const encodedHandle = encodeURIComponent(dsoHandle);
  const pidLink = 'https://rest.api/rest/api/pid/find{?id}';
  const requestHandleURL = `https://rest.api/rest/api/pid/find?id=${encodedHandle}`;
  const requestUUIDURL = `https://rest.api/rest/api/pid/find?id=${dsoUUID}`;
  const requestUUID = '34cfed7c-f597-49ef-9cbe-ea351f0023c2';

  beforeEach(() => {
    scheduler = getTestScheduler();

    halService = jasmine.createSpyObj('halService', {
      getEndpoint: cold('a', {a: pidLink})
    });
    requestService = jasmine.createSpyObj('requestService', {
      generateRequestId: requestUUID,
      configure: true
    });
    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: cold('a', {
        a: remoteData
      })
    });
    router = {
      navigate: jasmine.createSpy('navigate')
    };
    remoteData = {
      isSuccessful: true,
      error: undefined,
      hasSucceeded: true,
      isLoading: false,
      payload: {
        type: 'item',
        uuid: '123456789'
      }
    };
    objectCache = {} as ObjectCacheService;
    const store = {} as Store<CoreState>;
    const notificationsService = {} as NotificationsService;
    const http = {} as HttpClient;
    const comparator = {} as any;
    const dataBuildService = {} as NormalizedObjectBuildService;

    service = new DsoDataRedirectService(
      requestService,
      rdbService,
      dataBuildService,
      store,
      objectCache,
      halService,
      notificationsService,
      http,
      comparator,
      router
    );
  });

  describe('findById', () => {
    it('should call HALEndpointService with the path to the pid endpoint', () => {
      scheduler.schedule(() => service.findById(dsoUUID));
      scheduler.flush();

      expect(halService.getEndpoint).toHaveBeenCalledWith('pid');
    });

    it('should configure the proper FindByIDRequest for uuid', () => {
      scheduler.schedule(() => service.findById(dsoUUID, IdentifierType.UUID));
      scheduler.flush();

      expect(requestService.configure).toHaveBeenCalledWith(new FindByIDRequest(requestUUID, requestUUIDURL, dsoUUID, IdentifierType.UUID), false);
    });

    it('should configure the proper FindByIDRequest for handle', () => {
      scheduler.schedule(() => service.findById(dsoHandle, IdentifierType.HANDLE));
      scheduler.flush();

      expect(requestService.configure).toHaveBeenCalledWith(new FindByIDRequest(requestUUID, requestHandleURL, dsoHandle, IdentifierType.HANDLE), false);
    });

    it('should navigate to dso route', () => {
      const redir = service.findById(dsoHandle, IdentifierType.HANDLE);
      // The framework would normally subscribe but do it here so we can test navigation.
      redir.subscribe();
      scheduler.schedule(() => redir);
      scheduler.flush();
      expect(router.navigate).toHaveBeenCalledWith([remoteData.payload.type + 's/' + remoteData.payload.uuid]);
    });
  })
});
