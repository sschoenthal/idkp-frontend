import {Pageable} from "./pageable.model";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from "rxjs/Observable";

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

  public getNavigationObservable(): Observable<Pagination> {
    return (this.navigationSubject).publishReplay(1).refCount();
  }

  public getObservable(): Observable<Pagination> {
    return (this.dataSubject).publishReplay(1).refCount();
  }

  public getPage(): number {
    return this.page;
  }

  public setPage(number: number): void {
    this.page = number;
    this.setNavigationChanged();
  }

  public getPages(): number[] {
    return this.pages;
  }

  public getPerPageSize(): number {
    return this.perPageSize;
  }

  public setPerPageSize(perPageSize: number): void {
    this.perPageSize = perPageSize;
    this.setNavigationChanged();
  }

  public getPageElements(): number {
    return this.pageElements;
  }

  public getTotalElements(): number {
    return this.totalElements;
  }

  public getSortProperty(): string {
    return this.sortProperty;
  }

  public setSortProperty(property: string): void {
    this.sortProperty = property;
    this.setNavigationChanged();
  }

  public getSortOrder(): string {
    return this.sortOrder;
  }

  public setSortOrder(sortOrder: string): void {
    this.sortOrder = sortOrder;
    this.setNavigationChanged();
  }

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
