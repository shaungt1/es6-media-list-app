import { PollingService } from './polling.service';
import { EVENT_POLLING_INTERVAL_CHANGED, EVENT_POLLING_RESULT } from '../app.constants';

describe('PollingService', () => {
    let eventEmitterSpy;
    let pollingService;
    let apiServiceSpy;

    beforeEach(() => {
        eventEmitterSpy = jasmine.createSpyObj('EventEmitter', ['on', 'emit']);
        apiServiceSpy = jasmine.createSpyObj('ApiService', ['getAllMediaItems']);
    });

    describe('init', () => {
        it('should register restartWithNewIntervalSeconds on event', () => {
            const getAllMediaItemsDeferred = new jQuery.Deferred();
            apiServiceSpy.getAllMediaItems.and.returnValue(getAllMediaItemsDeferred.promise());
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);

            eventEmitterSpy.on.and.callFake((eventKey, callbackFn) => {
                callbackFn();
            });
            spyOn(pollingService, 'restartWithNewIntervalSeconds');

            pollingService.init();

            expect(eventEmitterSpy.on)
                .toHaveBeenCalledWith(EVENT_POLLING_INTERVAL_CHANGED, jasmine.any(Function));
            expect(pollingService.restartWithNewIntervalSeconds).toHaveBeenCalled();
        });
    });

    describe('setPollingIntervalMilliseconds', () => {
        beforeEach(() => {
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
        });

        it('should exist', () => {
            expect(pollingService.setPollingIntervalMilliseconds).toBeDefined();
        });

        it('should set polling interval ms', () => {
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
            const newPollingInterval = 120000;
            pollingService.setPollingIntervalMilliseconds(newPollingInterval);
            expect(pollingService.pollingIntervalMilliseconds).toEqual(newPollingInterval);
        });
    });

    describe('start', () => {
        beforeEach(() => {
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should exist', () => {
            expect(pollingService.start).toBeDefined();
        });

        it('should call poll immediately', () => {
            spyOn(pollingService, 'poll');
            pollingService.start();
            expect(pollingService.poll).toHaveBeenCalled();
            expect(pollingService.poll.calls.count()).toEqual(1);
        });

        it('should call poll after the given interval', () => {
            spyOn(pollingService, 'poll');
            pollingService.start();
            expect(pollingService.poll.calls.count()).toEqual(1);
            jasmine.clock().tick(pollingService.pollingIntervalMilliseconds);
            expect(pollingService.poll.calls.count()).toEqual(2);
        });
    });

    describe('poll', () => {
        let getAllMediaItemsDeferred;
        beforeEach(() => {
            getAllMediaItemsDeferred = new jQuery.Deferred();
            jasmine.clock().install();
            apiServiceSpy.getAllMediaItems.and.returnValue(getAllMediaItemsDeferred.promise());
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should exist', () => {
            expect(pollingService.poll).toBeDefined();
        });

        it('should call api service getAllMediaItems', () => {
            pollingService.poll();
            expect(apiServiceSpy.getAllMediaItems).toHaveBeenCalled();
        });

        it('should call EventEmitter emit', () => {
            const getAllMediaItemsResult = 'dummy values';
            pollingService.poll();
            getAllMediaItemsDeferred.resolve(getAllMediaItemsResult);
            jasmine.clock().tick(0);
            expect(eventEmitterSpy.emit)
                .toHaveBeenCalledWith(EVENT_POLLING_RESULT, getAllMediaItemsResult);
        });

        it('should call stop and window alert on error', () => {
            spyOn(pollingService, 'stop');
            spyOn(window, 'alert');
            pollingService.poll();
            getAllMediaItemsDeferred.reject();
            jasmine.clock().tick(0);
            expect(pollingService.stop).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalled();
        });
    });

    describe('stop', () => {
        let getAllMediaItemsDeferred;

        beforeEach(() => {
            getAllMediaItemsDeferred = new jQuery.Deferred();
            apiServiceSpy.getAllMediaItems.and.returnValue(getAllMediaItemsDeferred.promise());
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
        });

        beforeEach(() => {
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
        });

        it('should exist', () => {
            expect(pollingService.stop).toBeDefined();
        });

        it('should not call clearInterval when there is no polling interval id', () => {
            spyOn(window, 'clearInterval');

            expect(pollingService.pollingIntervalId).toBeNull();
            pollingService.stop();
            expect(window.clearInterval).not.toHaveBeenCalledWith(pollingService.pollingIntervalId);
        });

        it('should call clearInterval when polling interval id exists', () => {
            spyOn(window, 'clearInterval');

            pollingService.start();
            expect(pollingService.pollingIntervalId).not.toBeNull();
            const pollingIntervalBeforeStop = pollingService.pollingIntervalId;
            pollingService.stop();
            expect(window.clearInterval).toHaveBeenCalledWith(pollingIntervalBeforeStop);
            expect(pollingService.pollingIntervalId).toBeNull();
        });
    });

    describe('restart', () => {
        let getAllMediaItemsDeferred;
        beforeEach(() => {
            getAllMediaItemsDeferred = new jQuery.Deferred();
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
            apiServiceSpy.getAllMediaItems.and.returnValue(getAllMediaItemsDeferred.promise());
        });

        it('should exist', () => {
            expect(pollingService.restart).toBeDefined();
        });

        it('should call stop and start', () => {
            spyOn(pollingService, 'start');
            spyOn(pollingService, 'stop');
            pollingService.restart();
            expect(pollingService.stop).toHaveBeenCalled();
            expect(pollingService.start).toHaveBeenCalled();
        });
    });

    describe('restartWithNewIntervalSeconds', () => {
        let getAllMediaItemsDeferred;

        beforeEach(() => {
            getAllMediaItemsDeferred = new jQuery.Deferred();
            apiServiceSpy.getAllMediaItems.and.returnValue(getAllMediaItemsDeferred.promise());
            pollingService = new PollingService(eventEmitterSpy, apiServiceSpy);
        });

        it('should exist', () => {
            expect(pollingService.restartWithNewIntervalSeconds).toBeDefined();
        });

        it('should call setPollingIntervalMilliseconds', () => {
            const seconds = 40;
            spyOn(pollingService, 'setPollingIntervalMilliseconds');
            pollingService.restartWithNewIntervalSeconds(seconds);
            expect(pollingService.setPollingIntervalMilliseconds)
                .toHaveBeenCalledWith(seconds * 1000);
        });
    });
});
