import ModuleInterface from './ModuleInterface.mjs';
import loadStylesheet from '../../loadStylesheet.js';
import * as DLM from '../../droneLinkMsg.mjs';
//import {} from '../../navMath.mjs';


//loadStylesheet('./css/modules/interfaces/Sailor.css');


export default class Nav extends ModuleInterface {
	constructor(channel, state) {
    super(channel, state);

    this.locationReceived = false;
    this.lastReceived = false;
    this.targetReceived = false;
	}

  update() {
    if (!super.update()) return;

    var node = this.channel.node.id;
    var channel = this.channel.channel;

    // redraw canvas

    var heading = this.state.getParamValues(node, channel, 8, [0])[0];

    var adjHeading = this.state.getParamValues(node, channel, 20, [0])[0];

    var wind = this.state.getParamValues(node, channel, 21, [0])[0];

    var crosstrack = this.state.getParamValues(node, channel, 17, [0])[0];


    var c = this.canvas[0];
    var ctx = c.getContext("2d");

    // keep width updated
    var w = this.ui.width();
    ctx.canvas.width = w;
    var cx = w/2;

    ctx.fillStyle = '#343a40';
    ctx.fillRect(0,0,w,200);


    // fill central region
    ctx.beginPath();
    ctx.arc(cx, 100, 30, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, 100, 80, 0, 2 * Math.PI);
    ctx.stroke();
		ctx.beginPath();
    ctx.arc(cx, 100, 30, 0, 2 * Math.PI);
    ctx.stroke();

    // draw ticks
    ctx.beginPath();
    for (var i =0; i<12; i++) {
      var ang = (i*30) * Math.PI / 180;
      ctx.moveTo(cx + 80*Math.cos(ang), 100 + 80*Math.sin(ang));
      ctx.lineTo(cx + 90*Math.cos(ang), 100 + 90*Math.sin(ang) );
    }
    ctx.stroke();

		// hands
    this.drawLabelledHand(heading, '', 30,90, '#5F5');
    this.drawLabelledHand(adjHeading, '', 30, 90, '#FF5');
    this.drawLabelledHand(wind, '', 60, 110, '#55F');

    // legend - top right
		ctx.textAlign = 'right';
    ctx.font = '12px serif';
    ctx.fillStyle = '#5F5';
    ctx.fillText('Heading', w-5, 12);
    ctx.fillStyle = '#FF5';
    ctx.fillText('Adj. Heading', w-5, 26);
    ctx.fillStyle = '#55F';
    ctx.fillText('Wind', w-5, 40);



    // crosstrack  -top left
    ctx.fillStyle = '#FFF';
		ctx.textAlign = 'left';
    ctx.font = '12px serif';
    ctx.fillText('Crosstrack', 5, 12);
    ctx.font = '20px bold serif';
    ctx.fillText(crosstrack.toFixed(1), 5, 35);
  }


  queryMissing() {
    var node = this.channel.node.id;
    var channel = this.channel.channel;
    
    // query missing params in order
    if (this.locationReceived) {
      if (this.targetReceived) {
        if (!this.lastReceived) {
          // do we already have a last value in state?
        var last = this.state.getParamValues(node, channel, 15, [0,0,0]);
        if (last[0] != 0) {
          this.channel.node.updateMapParam('last', 2, last, this.channel.channel, 15);
          this.lastReceived = true;
        } else 
          this.queryParam(15);
        }
      } else {
        // do we already have a target value in state?
        var target = this.state.getParamValues(node, channel, 12, [0,0,0]);
        if (target[0] != 0) {
          this.channel.node.updateMapParam('target', 2, target, this.channel.channel, 12);
          this.targetReceived = true;
        } else 
          this.queryParam(12);
      }
    }    
  }

  onParamValue(data) {
    if (!this.built) return;

    // location
		if (data.param == 10 && data.msgType == DLM.DRONE_LINK_MSG_TYPE_FLOAT) {
			// pass onto node for mapping
			this.channel.node.updateMapParam('location', 2, data.values, this.channel.channel, 10);
      this.locationReceived = true;

      this.queryMissing();
		}

    // heading
		if (data.param == 8 && data.msgType == DLM.DRONE_LINK_MSG_TYPE_FLOAT) {
			// pass onto node for mapping
			//this.channel.node.updateMapParam('heading', 2, data.values, this.channel.channel, 8);
		}

    // target
		if (data.param == 12 && data.msgType == DLM.DRONE_LINK_MSG_TYPE_FLOAT) {
			// pass onto node for mapping
      console.log('target received');
			this.channel.node.updateMapParam('target', 2, data.values, this.channel.channel, 12);
      this.targetReceived = true;
		}

    // last
		if (data.param == 15 && data.msgType == DLM.DRONE_LINK_MSG_TYPE_FLOAT) {
			// pass onto node for mapping
      console.log('last received');
			this.channel.node.updateMapParam('last', 2, data.values, this.channel.channel, 15);
      this.lastReceived = true;
		}

    // mode
    if (data.param == 14 && data.msgType == DLM.DRONE_LINK_MSG_TYPE_UINT8_T) {
      this.modeSelect.val(data.values[0]);
    }

    // distance
    if (data.param == 9 && data.msgType == DLM.DRONE_LINK_MSG_TYPE_FLOAT) {
      // 9 - distance
      var d = data.values[0];
      if (d == undefined) d = 0;
      var dStr = '';
      if ( d < 1000) {
        dStr = d.toFixed( d < 10 ? 1 : 0) + 'm';
      } else {
        dStr = (d/1000).toFixed( 1 ) + 'km';
      }
      this.widgetText.html(dStr);
    }

    this.updateNeeded = true;
  }


	build() {
    super.build('Nav');

    this.modeSelect = $('<select class="navModeSelect"></select>');
    // add mode options
    this.modeSelect.append($('<option value="0">Idle</option>'));
    this.modeSelect.append($('<option value="1">Goto</option>'));
    this.modeSelect.append($('<option value="2">AbsCourse</option>'));
    this.modeSelect.append($('<option value="3">RelCourse</option>'));
    this.modeSelect.append($('<option value="4">Backaway</option>'));
    this.modeSelect.append($('<option value="5">Orbit</option>'));
    this.modeSelect.change((e)=>{
      // get value
      var newMode = this.modeSelect.val();

      var qm = new DLM.DroneLinkMsg();
			qm.node = this.channel.node.id;
			qm.channel = this.channel.channel;
			qm.param = 14;
			qm.setUint8([ newMode ]);
			this.state.send(qm);

      this.queryParam(14);
    });

    this.ui.append(this.modeSelect);

    this.canvas = $('<canvas height=200 />');
    this.canvas.on('click', (e)=>{
      //  manually adjust target on click

      var offsetX = $( e.target ).offset().left;
      var offsetY = $( e.target ).offset().top;
      var w = $(e.target).innerWidth();
      var h = $(e.target).innerHeight();

      var x = (e.pageX - offsetX) - w/2;
      var y = (e.pageY - offsetY) - h/2;

      var ang = 90 + Math.atan2(y,x) * 180 / Math.PI;

      console.log(x,y, ang);

      var qm = new DLM.DroneLinkMsg();
			qm.node = this.channel.node.id;
			qm.channel = this.channel.channel;
			qm.param = 8;
			qm.setFloat([ ang ]);
			this.state.send(qm);

      var qm = new DLM.DroneLinkMsg();
			qm.node = this.channel.node.id;
			qm.channel = this.channel.channel;
			qm.param = 8;
			qm.setUint8([ ang ]);
      qm.msgType = DLM.DRONE_LINK_MSG_TYPE_QUERY;
			this.state.send(qm);
    });

    this.ui.append(this.canvas);

    // widget
		this.widget = $('<div class="widget"><i class="fas fa-drafting-compass"></i></div>');
		this.channel.node.addWidget(this.widget);

		this.widgetText = $('<span>?m</span>');
		this.widget.append(this.widgetText);

    super.finishBuild();
  }
}
