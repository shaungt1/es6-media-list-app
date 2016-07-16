import { ApiService } from './api.service';

describe('ApiService', () => {
    describe('getAllMediaItems', ()=> {
        let apiService, mockMediaItems, jQuery;
        beforeEach(()=> {
            mockMediaItems = [{
                title: "mock media item"
            }];

            jQuery = jasmine.createSpyObj("jQuery", ["getJSON"]);
            jQuery.getJSON.and.returnValue(mockMediaItems);

            apiService = new ApiService(jQuery);
        });

        it('should exist', () => {
            expect(apiService.getAllMediaItems).toBeDefined();
        });

        it('should call getJSON', () => {
            apiService.getAllMediaItems();
            expect(jQuery.getJSON).toHaveBeenCalled();
        });

        it('should return the requested value', () => {
            let result = apiService.getAllMediaItems();
            expect(result).toEqual(mockMediaItems);
        });

    })
});
