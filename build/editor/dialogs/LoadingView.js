class LoadingView {

    constructor(color, backgroundColor) { 
			this.html = document.createElement("div");
			this.html.className +="dialog-full-screen";
			this.html.style="background:"+ backgroundColor;
			this.html.innerHTML =
				'<div class="mdc-circular-progress" role="progressbar" aria-label="Example Progress Bar" aria-valuemin="0" aria-valuemax="1" style="width:96px; height:96px">'+
					'<div class="mdc-circular-progress__determinate-container">'+
						'<svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">'+
						'<circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4"/>'+
						'<circle class="mdc-circular-progress__determinate-circle" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="113.097" stroke-width="4"/>'+
						'</svg>'+
					'</div>'+
					'<div class="mdc-circular-progress__indeterminate-container">'+
						'<div class="mdc-circular-progress__spinner-layer">'+
						'<div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left">'+
							'<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">'+
							'<circle stroke="'+ color+ '" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>'+
							'</svg>'+
						'</div><div class="mdc-circular-progress__gap-patch">'+
							'<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">'+
							'<circle stroke="'+ color+ '" x="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2"/>'+
							'</svg>'+
						'</div><div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right">'+
							'<svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">'+
							'<circle stroke="'+ color+ '" cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"/>'+
							'</svg>'+
						'</div>'+
						'</div>'+
					'</div>'+
				'<div>';
		this.progress= mdc.circularProgress.MDCCircularProgress.attachTo(this.html.querySelector('.mdc-circular-progress'));
		this.progress.open();
		this.progress.determinate=false;
	}

// Utils
	closeDialog(){
		var node=document.querySelector(".dialog-full-screen");
		node.parentNode.removeChild(node);
	}

}
