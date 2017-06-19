import {Pageable} from "./pageable.model";
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from "rxjs/Observable";

export class Pagination {

  public page: BehaviorSubject<number>;
  public perPageSize: BehaviorSubject<number>;
  private pages: BehaviorSubject<number[]>;

  public pageElements: BehaviorSubject<number>;
  public totalElements: BehaviorSubject<number>;

  public sortProperty: BehaviorSubject<string>;
  public sortOrder: BehaviorSubject<string>;
  public sortIgnoreCase: BehaviorSubject<boolean>;

  private subject: BehaviorSubject<Pagination>;

  constructor(page: number, pageSize: number, sortProperty: string) {
    this.page = new BehaviorSubject(page);
    this.perPageSize = new BehaviorSubject(pageSize);
    this.pages = new BehaviorSubject([0]);
    this.pageElements = new BehaviorSubject(0);
    this.totalElements = new BehaviorSubject(0);
    this.sortProperty = new BehaviorSubject(sortProperty);
    this.sortOrder = new BehaviorSubject('asc');
    this.sortIgnoreCase = new BehaviorSubject(true);
  }

  public attachSubject(subject: BehaviorSubject<Pagination>): void {
    this.subject = subject;//I'm pretty sure there will be a refactoring here, there has to be a more elegant solution for this
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

  public getPages(): Observable<[number]> {
    return this.pages.publishReplay(1).refCount();
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
