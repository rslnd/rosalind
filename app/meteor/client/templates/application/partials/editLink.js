Template.editLink.events({
  'click a'() {
    let editUrl = '/' + [this.collectionSlug(), this._id, 'edit'].join('/');
    Router.go(editUrl);
  }
});
