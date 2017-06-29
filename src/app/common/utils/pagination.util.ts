import {Pageable} from "./pageable.model";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from "rxjs/Observable";
/*
 * Utility class to support pagination of content retrieved from backend.
 */
export class Pagination {

  private page: number;
  private perPageSize: number;
  private pages: number[];

  private pageElements: number;
  private totalElements: number;

  private sortProperty: string;
  private sortOrder: string;

  private navigationSubject: BehaviorSubject<Pagination>;
  private dataSubject: BehaviorSubject<Pagination>;

  /*
   * Create a new pagination instance providing it's initial configuration regarding selected page number, page size and sort property name.
   */
  constructor(page: number, pageSize: number, sortProperty: string) {
    this.page = page;
    this.perPageSize = pageSize;
    this.pages = [0];
    this.pageElements = 0;
    this.totalElements = 0;
    this.sortProperty = sortProperty;
    this.sortOrder = 'asc';
    this.navigationSubject = new BehaviorSubject(this);
    this.dataSubject = new BehaviorSubject(this);
  }

  /*
   * Retrieve the pagination observable for navigation.
   * This observable is only triggered if a member was changed which is relevant for reloading content from the back-end.
   */
  public getNavigationObservable(): Observable<Pagination> {
    return (this.navigationSubject).publishReplay(1).refCount();
  }

  /*
   * Retrieve the pagination observable.
   * This observable is triggered if any member was changed.
   */
  public getObservable(): Observable<Pagination> {
    return (this.dataSubject).publishReplay(1).refCount();
  }

  /*
   * Retrieve the current page number.
   */
  public getPage(): number {
    return this.page;
  }

  /*
   * Change the current page number.
   * This member is subject to navigation, so the navigation observable will be triggered.
   */
  public setPage(number: number): void {
    this.page = number;
    this.setNavigationChanged();
  }

  /*
   * Retrieve the currently available pages.
   */
  public getPages(): number[] {
    return this.pages;
  }

  /*
   * Retrieve the setting for page size (max. number of elements shown on a page).
   */
  public getPerPageSize(): number {
    return this.perPageSize;
  }

  /*
   * Change the current page size (max. number of elements shown on a page).
   * This member is subject to navigation, so the navigation observable will be triggered.
   */
  public setPerPageSize(perPageSize: number): void {
    this.perPageSize = perPageSize;
    this.setNavigationChanged();
  }

  /*
   * Retrieve number of elements on the current page.
   */
  public getPageElements(): number {
    return this.pageElements;
  }

  /*
   * Retrieve total number of elements (from all pages)
   */
  public getTotalElements(): number {
    return this.totalElements;
  }

  /*
   * Retrieve the setting for the sort property.
   */
  public getSortProperty(): string {
    return this.sortProperty;
  }

  /*
   * Change the sort property.
   * This member is subject to navigation, so the navigation observable will be triggered.
   */
  public setSortProperty(property: string): void {
    this.sortProperty = property;
    this.setNavigationChanged();
  }

  /*
   * Retrieve the setting for the sort order. (asc/desc)
   */
  public getSortOrder(): string {
    return this.sortOrder;
  }

  /*
   * Change the sort order (asc/desc).
   * This member is subject to navigation, so the navigation observable will be triggered.
   */
  public setSortOrder(sortOrder: string): void {
    this.sortOrder = sortOrder;
    this.setNavigationChanged();
  }

  /*
   * Initialize pagination according to the given pageable information.
   */
  public fromResponse(pageable: Pageable): void {
    let pages: number[] = [0];
    for (let i = 1; i < pageable.totalPages; i++) {
      pages.push(i);
    }
    this.pages = pages;
    this.pageElements = pageable.numberOfElements;
    this.totalElements = pageable.totalElements;
    this.setDataChanged();
  }

  /*
   * Retrieve a partial URI containing pagination information subject to navigation (retrieval of backend content)
   */
  public toReqParamURIPart(): string {
    return (`?page=${this.page}&size=${this.perPageSize}&sort=${this.sortProperty},${this.sortOrder}`);
  }

  private setNavigationChanged(): void {
    this.navigationSubject.next(this);
    this.setDataChanged();
  }

  private setDataChanged(): void {
    this.dataSubject.next(this);
  }
}
