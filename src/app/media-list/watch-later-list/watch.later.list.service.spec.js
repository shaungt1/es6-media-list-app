import { WatchListService } from './watch.later.list.service';
import { STORAGE_ID_WATCH_LATER } from '../../app.constants';

describe('WatchListService', ()=> {
    let eventEmitterSpy, watchListService, apiServiceSpy, storageServiceSpy;

    beforeEach(()=> {
        eventEmitterSpy = jasmine.createSpyObj("EventEmitter", ['on', 'emit']);
        apiServiceSpy = jasmine.createSpyObj("ApiService", ['getAllMediaItems']);
        storageServiceSpy = jasmine.createSpyObj("StorageService", ['add', 'get', 'remove']);
    });

    describe('loadWatchListEntriesFromStorage', ()=> {
        beforeEach(()=> {
            watchListService = new WatchListService(eventEmitterSpy, storageServiceSpy);

            storageServiceSpy.add.and.returnValue('');
        });

        it('should exist', ()=> {
            expect(watchListService.loadWatchListEntriesFromStorage).toBeDefined();
        });

        it('should call storage service get', () => {
            watchListService.loadWatchListEntriesFromStorage();
            expect(watchListService.storageService.get).toHaveBeenCalledWith(STORAGE_ID_WATCH_LATER);
        });

        it('should load storage value into watchListEntries', ()=> {
            let dummyValue = 'dummy';
            storageServiceSpy.get.and.returnValue(dummyValue);
            watchListService.loadWatchListEntriesFromStorage();
            expect(watchListService.watchListEntries).toEqual(dummyValue);
        });

        it('should initialize watchListEntries when storage value is empty', ()=> {
            storageServiceSpy.get.and.returnValue('');
            watchListService.loadWatchListEntriesFromStorage();
            expect(watchListService.watchListEntries).toEqual([]);
        });
    });

    describe('getWatchList', ()=> {
        beforeEach(()=> {
            watchListService = new WatchListService(eventEmitterSpy, storageServiceSpy);
            storageServiceSpy.add.and.returnValue('');
        });

        it('should exist', ()=> {
            expect(watchListService.getWatchList).toBeDefined();
        });

        it('should call getCachedMediaForEntry for every item in watchListEntries', ()=> {
            watchListService.watchListEntries = ['x', 'y'];
            let expectedDummyResult = ['dummy', 'dummy'];
            spyOn(watchListService, 'getCachedMediaForEntry').and.returnValue('dummy');
            let getWatchListResult = watchListService.getWatchList();
            expect(expectedDummyResult).toEqual(getWatchListResult);
        });
    });

    describe('getCachedMediaForEntry', ()=> {


        beforeEach(()=> {
            watchListService = new WatchListService(eventEmitterSpy, storageServiceSpy);
            storageServiceSpy.add.and.returnValue('');
        });

        it('should exist', () => {
            expect(watchListService.getCachedMediaForEntry).toBeDefined();
        });

        it('should return cached media for entry', ()=> {
            let dummyEntry = {mediaId: 1, added: new Date(), title: 'dummy'};
            watchListService.mediaListCache = {1: {id: 1, title: 'dummy'}};

            let cachedMediaForEntry = watchListService.getCachedMediaForEntry(dummyEntry);
            expect(cachedMediaForEntry).toBeDefined();
            expect(cachedMediaForEntry.title).toEqual(dummyEntry.title);
            expect(cachedMediaForEntry.id).toEqual(dummyEntry.mediaId);
            expect(cachedMediaForEntry.addedAt).toEqual(dummyEntry.addedAt);
        })
    });

    describe('updateWatchList', ()=> {

        let dummyMediaCache;
        beforeEach(()=> {
            watchListService = new WatchListService(eventEmitterSpy, storageServiceSpy);
            storageServiceSpy.add.and.callFake((item)=> {
                return item;
            });
            dummyMediaCache = {id: 1, title: 'dummy'};
        });

        it('should exist', () => {
            expect(watchListService.updateWatchList).toBeDefined();
        });

        it('should update media list cache', ()=> {

            watchListService.updateWatchList(dummyMediaCache);
            expect(watchListService.mediaListCache).toEqual(dummyMediaCache);
        });

        it('should update watch list entries with selectCachedMediaItemForWatchList result', ()=> {
            let dummyResult = "dummy result";
            spyOn(watchListService, 'selectCachedMediaItemForWatchList').and.returnValue(dummyResult);

            watchListService.updateWatchList(dummyMediaCache);

            expect(watchListService.selectCachedMediaItemForWatchList).toHaveBeenCalled();
            expect(watchListService.watchListEntries).toEqual(dummyResult);
        });

        it('should call updateWatchListInStorage', ()=> {
            let dummyResult = "dummy result";
            spyOn(watchListService, 'selectCachedMediaItemForWatchList').and.returnValue(dummyResult);

            spyOn(watchListService, 'updateWatchListInStorage');
            watchListService.updateWatchList(dummyMediaCache);
            expect(watchListService.updateWatchListInStorage).toHaveBeenCalled();
        });
    });

    describe('addToWatchList', ()=> {

        beforeEach(()=> {
            watchListService = new WatchListService(eventEmitterSpy, storageServiceSpy);
            storageServiceSpy.add.and.callFake((item)=> {
                return item;
            });
        });

        it('should exist', ()=> {
            expect(watchListService.addToWatchList).toBeDefined();
        });

        it('should add the given id with current date to the watchListEntries', ()=> {
            let dummyId = 12;
            let oldDate = Date;

            spyOn(window, 'Date').and.callFake(() => {
                return new oldDate();
            });

            watchListService.addToWatchList(dummyId);
            expect(watchListService.watchListEntries.length).toEqual(1);
            let newEntry = watchListService.watchListEntries[0];

            expect(newEntry.addedAt.getTime()).toEqual((new oldDate()).getTime());
        });
    });

    describe('removeFromWatchList', ()=> {

        beforeEach(()=> {
            watchListService = new WatchListService(eventEmitterSpy, storageServiceSpy);
            storageServiceSpy.add.and.returnValue('');

            storageServiceSpy.remove.and.returnValue('');
        });

        it('should exist', ()=> {
            expect(watchListService.removeFromWatchList).toBeDefined();
        });

        it('should remove given id from storage', ()=> {
            let dummyResult = "dummy result";
            let dummyId = 2;
            watchListService.watchListEntries = [{
                mediaId: 2
            }];

            spyOn(watchListService, 'updateWatchListInStorage');
            watchListService.removeFromWatchList(dummyId);
            expect(watchListService.updateWatchListInStorage).toHaveBeenCalled();
            expect(watchListService.watchListEntries).toEqual([]);
        });
    });

    describe('selectCachedMediaItemForWatchList', () => {
        beforeEach(()=> {
            watchListService = new WatchListService(eventEmitterSpy, storageServiceSpy);
            storageServiceSpy.add.and.returnValue('');

            storageServiceSpy.remove.and.returnValue('');
        });

        it('should filter out entries which are represent in the mediacache', () => {
            watchListService.mediaListCache = { 1: 'dummy 1', '2': 'dummy 2' };
            watchListService.watchListEntries = [{mediaId: 2}];

            let selectCachedMediaResult = watchListService.selectCachedMediaItemForWatchList();

            expect(selectCachedMediaResult).toEqual([{mediaId: 2}]);
        });

        it('should not contain items removed from cache', () => {
            watchListService.mediaListCache = { 1: 'dummy 1', '3': 'dummy 3' };
            watchListService.watchListEntries = [{mediaId: 2}];

            let selectCachedMediaResult = watchListService.selectCachedMediaItemForWatchList();

            expect(selectCachedMediaResult).toEqual([]);
        });
    });
});