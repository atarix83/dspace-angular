import { SortOptions } from '../../../cache/models/sort-options.model';
import { FindListOptions } from '../../../data/request.models';
import { RequestParam } from '../../../cache/models/request-param.model';
import { isNotEmpty } from '../../../../shared/empty.util';

/**
 * Representing properties used to build a vocabulary find request
 */
export class VocabularyFindOptions extends FindListOptions {

  constructor(public collection: string = '',
              public name: string = '',
              public metadata: string = '',
              public query: string = '',
              public elementsPerPage?: number,
              public currentPage?: number,
              public sort?: SortOptions,
              public filter?: string,
              public exact?: string,
              public entryID?: string,
              ) {
    super();

    const searchParams = [];
    if (isNotEmpty(metadata)) {
      searchParams.push(new RequestParam('metadata', metadata))
    }
    if (isNotEmpty(collection)) {
      searchParams.push(new RequestParam('collection', collection))
    }
    if (isNotEmpty(query)) {
      searchParams.push(new RequestParam('query', query))
    }
    if (isNotEmpty(filter)) {
      searchParams.push(new RequestParam('filter', filter))
    }
    if (isNotEmpty(exact)) {
      searchParams.push(new RequestParam('exact', exact))
    }
    if (isNotEmpty(entryID)) {
      searchParams.push(new RequestParam('entryID', entryID))
    }
    this.searchParams = searchParams;
  }
}