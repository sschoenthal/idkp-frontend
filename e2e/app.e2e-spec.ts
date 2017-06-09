import { IDKP2Page } from './app.po';

describe('i-dkp2 App', () => {
  let page: IDKP2Page;

  beforeEach(() => {
    page = new IDKP2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
