import {Pageable} from "./pageable.model";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from "rxjs/Observable";

export class Pagination {

  private page: BehaviorSubject<number>;
  private perPageSize: BehaviorSubject<number>;
  private pages: BehaviorSubject<number[]>;

  private pageElements: BehaviorSubject<number>;
  private totalElements: BehaviorSubject<number>;

  private sortProperty: BehaviorSubject<string>;
  private sortOrder: BehaviorSubject<string>;

  private subject: BehaviorSubject<Pagination>;

  constructor(page: number, pageSize: number, sortProperty: string) {
    this.page = new BehaviorSubject(page);
    this.perPageSize = new BehaviorSubject(pageSize);
    this.pages = new BehaviorSubject([0]);
    this.pageElements = new BehaviorSubject(0);
    this.totalElements = new BehaviorSubject(0);
    this.sortProperty = new BehaviorSubject(sortProperty);
    this.sortOrder = new BehaviorSubject('asc');
    this.subject = new BehaviorSubject(this);
    this.perPageSize.skip(1).subscribe({
      next: (pageSize: number) => this.page.next(0)
    });
    this.page.skip(1).subscribe({
      next: (page: number) => this.subject.next(this)
    });
    this.sortProperty.skip(1).subscribe({
      next: (property: string) => this.subject.next(this)
    });
    this.sortOrder.skip(1).subscribe({
      next: (order: string) => this.subject.next(this)
    });
  }

  public getObservable(): Observable<Pagination> {
    return (this.subject).publishReplay(1).refCount();
  }

  public getPage(): Observable<number> {
    return this.page.publishReplay(1).refCount();
  }

  public getPageValue(): number {
    return this.page.getValue();
  }

  public setPageValue(number: number): void {
    this.page.next(number);
  }

  public getPages(): Observable<[number]> {
    return this.pages.publishReplay(1).refCount();
  }

  public getPagesValue(): number[] {
    return this.pages.getValue();
  }

  public getPerPageSize(): Observable<number> {
    return this.perPageSize.publishReplay(1).refCount();
  }

  public getPerPageSizeValue(): number {
    return this.perPageSize.getValue();
  }

  public setPerPageSizeValue(perPageSize: number): void {
    this.perPageSize.next(perPageSize);
  }

  public getPageElements(): Observable<number> {
    return this.pageElements.publishReplay(1).refCount();
  }

  public getPageElementsValue(): number {
    return this.pageElements.getValue();
  }

  public getTotalElements(): Observable<number> {
    return this.totalElements.publishReplay(1).refCount();
  }

  public getTotalElementsValue(): number {
    return this.totalElements.getValue();
  }

  public getSortProperty(): Observable<string> {
    return this.sortProperty.publishReplay(1).refCount();
  }

  public getSortPropertyValue(): string {
    return this.sortProperty.getValue();
  }

  public setSortPropertyValue(property: string): void {
    this.sortProperty.next(property);
  }

  public getSortOrder(): Observable<string> {
    return this.sortOrder.publishReplay(1).refCount();
  }

  public getSortOrderValue(): string {
    return this.sortOrder.getValue();
  }

  public setSortOrderValue(sortOrder: string): void {
    this.sortOrder.next(sortOrder);
  }

  public fromResponse(pageable: Pageable): void {
    let pages: number[] = [0];
    for (var i = 1; i < pageable.totalPages; i++) {
      pages.push(i);
    }
    this.pages.next(pages);
    this.pageElements.next(pageable.numberOfElements);
    this.totalElements.next(pageable.totalElements);
  }

  public toReqParamURIPart(): string {
    return (`?page=${this.page.getValue()}&size=${this.perPageSize.getValue()}&sort=${this.sortProperty.getValue()},${this.sortOrder.getValue()}`);
  }
}
