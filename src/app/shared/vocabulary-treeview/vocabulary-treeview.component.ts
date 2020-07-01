import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { filter, find, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { VocabularyEntryDetail } from '../../core/submission/vocabularies/models/vocabulary-entry-detail.model';
import { hasValue, isEmpty, isNotEmpty } from '../empty.util';
import { isAuthenticated } from '../../core/auth/selectors';
import { CoreState } from '../../core/core.reducers';
import { VocabularyTreeviewService } from './vocabulary-treeview.service';
import { LOAD_MORE, LOAD_MORE_ROOT, TreeviewFlatNode, TreeviewNode } from './vocabulary-treeview-node.model';
import { VocabularyOptions } from '../../core/submission/vocabularies/models/vocabulary-options.model';
import { PageInfo } from '../../core/shared/page-info.model';

/**
 * Component that show a hierarchical vocabulary in a tree view
 */
@Component({
  selector: 'ds-authority-treeview',
  templateUrl: './vocabulary-treeview.component.html',
  styleUrls: ['./vocabulary-treeview.component.scss']
})
export class VocabularyTreeviewComponent implements OnDestroy, OnInit {

  /**
   * The {@link VocabularyOptions} object
   */
  @Input() vocabularyOptions: VocabularyOptions;

  /**
   * Representing how many tree level load at initialization
   */
  @Input() preloadLevel = 2;

  /**
   * The vocabulary entry already selected, if any
   */
  @Input() selectedItem: any = null;

  /**
   * Contain a descriptive message for this vocabulary retrieved from i18n files
   */
  description: Observable<string>;

  /**
   * A map containing the current node showed by the tree
   */
  nodeMap = new Map<string, TreeviewFlatNode>();

  /**
   * A map containing all the node already created for building the tree
   */
  storedNodeMap = new Map<string, TreeviewFlatNode>();

  /**
   * Flat tree control object. Able to expand/collapse a subtree recursively for flattened tree.
   */
  treeControl: FlatTreeControl<TreeviewFlatNode>;

  /**
   * Tree flattener object. Able to convert a normal type of node to node with children and level information.
   */
  treeFlattener: MatTreeFlattener<TreeviewNode, TreeviewFlatNode>;

  /**
   * Flat tree data source
   */
  dataSource: MatTreeFlatDataSource<TreeviewNode, TreeviewFlatNode>;

  /**
   * The content of the search box used to search for a vocabulary entry
   */
  searchText: string;

  /**
   * A boolean representing if a search operation is pending
   */
  searching: Observable<boolean>;

  /**
   * An event fired when a vocabulary entry is selected.
   * Event's payload equals to {@link VocabularyEntryDetail} selected.
   */
  @Output() select: EventEmitter<VocabularyEntryDetail> = new EventEmitter<VocabularyEntryDetail>(null);

  /**
   * A boolean representing if user is authenticated
   */
  private isAuthenticated: Observable<boolean>;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   */
  private subs: Subscription[] = [];

  /**
   * Initialize instance variables
   *
   * @param {NgbActiveModal} activeModal
   * @param {VocabularyTreeviewService} vocabularyTreeviewService
   * @param {Store<CoreState>} store
   * @param {TranslateService} translate
   */
  constructor(
    public activeModal: NgbActiveModal,
    private vocabularyTreeviewService: VocabularyTreeviewService,
    private store: Store<CoreState>,
    private translate: TranslateService
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);

    this.treeControl = new FlatTreeControl<TreeviewFlatNode>(this.getLevel, this.isExpandable);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  /**
   * Get children for a given node
   * @param node The node for which to retrieve the children
   */
  getChildren = (node: TreeviewNode): Observable<TreeviewNode[]> => node.childrenChange;

  /**
   * Transform a {@link TreeviewNode} to {@link TreeviewFlatNode}
   * @param node The node to transform
   * @param level The node level information
   */
  transformer = (node: TreeviewNode, level: number) => {
    const existingNode = this.nodeMap.get(node.item.id);

    if (existingNode && existingNode.item.id !== LOAD_MORE && existingNode.item.id !== LOAD_MORE_ROOT) {
      return existingNode;
    }

    const newNode: TreeviewFlatNode = new TreeviewFlatNode(
      node.item,
      level,
      node.hasChildren,
      node.pageInfo,
      node.loadMoreParentItem,
      node.isSearchNode,
      node.isInInitValueHierarchy
    );
    this.nodeMap.set(node.item.id, newNode);

    if ((((level + 1) < this.preloadLevel) && newNode.expandable) || newNode.isSearchNode || newNode.isInInitValueHierarchy) {
      if (!newNode.isSearchNode) {
        this.loadChildren(newNode);
      }
      this.treeControl.expand(newNode);
    }
    return newNode;
  };

  /**
   * Get tree level for a given node
   * @param node The node for which to retrieve the level
   */
  getLevel = (node: TreeviewFlatNode) => node.level;

  /**
   * Check if a given node is expandable
   * @param node The node for which to retrieve the information
   */
  isExpandable = (node: TreeviewFlatNode) => node.expandable;

  /**
   * Check if a given node has children
   * @param _nodeData The node for which to retrieve the information
   */
  hasChildren = (_: number, _nodeData: TreeviewFlatNode) => _nodeData.expandable;

  /**
   * Check if a given node has more children to load
   * @param _nodeData The node for which to retrieve the information
   */
  isLoadMore = (_: number, _nodeData: TreeviewFlatNode) => _nodeData.item.id === LOAD_MORE;

  /**
   * Check if there are more node to load at root level
   * @param _nodeData The node for which to retrieve the information
   */
  isLoadMoreRoot = (_: number, _nodeData: TreeviewFlatNode) => _nodeData.item.id === LOAD_MORE_ROOT;

  /**
   * Initialize the component, setting up the data to build the tree
   */
  ngOnInit(): void {
    this.subs.push(
      this.vocabularyTreeviewService.getData().subscribe((data) => {
        this.dataSource.data = data;
      })
    );

    const descriptionLabel = 'tree.description.' + this.vocabularyOptions.name;
    this.description = this.translate.get(descriptionLabel).pipe(
      filter((msg) => msg !== descriptionLabel),
      startWith('')
    );

    // set isAuthenticated
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    this.searching = this.vocabularyTreeviewService.isSearching();

    this.isAuthenticated.pipe(
      find((isAuth) => isAuth)
    ).subscribe(() => {
      const valueId: string = (this.selectedItem) ? (this.selectedItem.authority || this.selectedItem.id) : null;
      this.vocabularyTreeviewService.initialize(this.vocabularyOptions, new PageInfo(), valueId);
    });
  }

  /**
   * Expand a node whose children are not loaded
   * @param item The VocabularyEntryDetail for which to load more nodes
   */
  loadMore(item: VocabularyEntryDetail) {
    this.vocabularyTreeviewService.loadMore(item);
  }

  /**
   * Expand the root node whose children are not loaded
   * @param node The TreeviewFlatNode for which to load more nodes
   */
  loadMoreRoot(node: TreeviewFlatNode) {
    this.vocabularyTreeviewService.loadMoreRoot(node);
  }

  /**
   * Load children nodes for a node
   * @param node The TreeviewFlatNode for which to load children nodes
   */
  loadChildren(node: TreeviewFlatNode) {
    this.vocabularyTreeviewService.loadMore(node.item, true);
  }

  /**
   * Method called on entry select
   * Emit a new select Event
   */
  onSelect(item: VocabularyEntryDetail) {
    this.select.emit(item);
    this.activeModal.close(item);
  }

  /**
   * Search for a vocabulary entry by query
   */
  search() {
    if (isNotEmpty(this.searchText)) {
      if (isEmpty(this.storedNodeMap)) {
        this.storedNodeMap = this.nodeMap;
      }
      this.nodeMap = new Map<string, TreeviewFlatNode>();
      this.vocabularyTreeviewService.searchByQuery(this.searchText);
    }
  }

  /**
   * Check if search box contains any text
   */
  isSearchEnabled() {
    return isNotEmpty(this.searchText);
  }

  /**
   * Reset tree resulting from a previous search
   */
  reset() {
    if (isNotEmpty(this.storedNodeMap)) {
      this.nodeMap = this.storedNodeMap;
      this.storedNodeMap = new Map<string, TreeviewFlatNode>();
      this.vocabularyTreeviewService.restoreNodes();
    }

    this.searchText = '';
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.vocabularyTreeviewService.cleanTree();
    this.subs
      .filter((sub) => hasValue(sub))
      .forEach((sub) => sub.unsubscribe());
  }
}