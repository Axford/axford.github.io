import Panel from './Panel.mjs';
import loadStylesheet from '../../loadStylesheet.js';

import Channel from '../Channel.mjs';

loadStylesheet('./css/modules/oui/panels/Management.css');


export default class Management extends Panel {

  constructor(node, tabs, panels) {
    super(node, tabs, panels);

    this.tabName = 'Management';
    this.title = 'Management';
    this.icon = 'fas fa-table';

    this.channels = {};

    this.build();
  }


  build() {
    super.build();

    // subscribe to module.new events
    this.node.state.on('module.new', (data)=>{
      if (data.node != this.node.id) return;

      //console.log('module.new: ' + data.node + '> ' + data.channel);

      // create new channel UI
      this.channels[data.channel] = new Channel(this.node, this.node.state, data, this.ui.panel);

      // sort
      var children = this.ui.panel.children();
      var sortList = Array.prototype.sort.bind(children);

      sortList((a,b)=>{
        return $(a).data('channel') - $(b).data('channel');
      });

      // re-append sorted children
      this.ui.panel.append(children);

      this.updateColumns();
    });

  }

  clear() {
    this.ui.panel.empty();
  }

  updateColumns() {
    var w = this.ui.panel.width();

    if ( w > 0) {
      // update column count
      var cols = Math.floor(w / 300);
      this.ui.panel.css('column-count', cols);
      return true;
    } 
    return false;
  }

  update() {
    if (!this.visible) return;

    this.updateInterfaces();
  }


  updateInterfaces() {
    for (const [key, chan] of Object.entries(this.channels)) {
      if (chan.interface) chan.interface.update();
    }
  }

  resize() {
    if (!this.built || !this.visible) return;

    if (this.updateColumns()) {
      this.updateInterfaces();
    }
  }

  show() {
    super.show();
    this.updateColumns();
    for (const [key, chan] of Object.entries(this.channels)) {
      chan.show();
    }
  }

  hide() {
    super.hide();
    for (const [key, chan] of Object.entries(this.channels)) {
      chan.hide();
    }
  }


}
