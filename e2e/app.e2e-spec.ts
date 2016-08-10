import { ConnectFourWebWorkerPage } from './app.po';

describe('connect-four-web-worker App', function() {
  let page: ConnectFourWebWorkerPage;

  beforeEach(() => {
    page = new ConnectFourWebWorkerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
