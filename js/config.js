if (!window.NexT) window.NexT = {};

(function() {
	
	//分享限制
	document.oncontextmenu=new Function("event.returnValue=false");  
	document.onselectstart=new Function("event.returnValue=false");  
	document.addEventListener('keydown', function(event){
		return !(
			112 == event.keyCode || //F1
			123 == event.keyCode || //F12
			event.ctrlKey && 82 == event.keyCode || //ctrl + R
			event.ctrlKey && 78 == event.keyCode || //ctrl + N
			event.ctrlKey && 85 == event.keyCode || //ctrl + U
			event.shiftKey && 121 == event.keyCode || //shift + F10
			event.altKey && 115 == event.keyCode || //alt + F4
			"A" == event.srcElement.tagName && event.shiftKey //shift + 点击a标签
		) || (event.returnValue = false)
	});
	document.ondragstart = function() {
        return false;
	};
	
  const className = 'next-config';

  const staticConfig = {};
  let variableConfig = {};

  const parse = (text) => {
    const jsonString = new DOMParser()
      .parseFromString(text, 'text/html').documentElement
      .textContent;
    return JSON.parse(jsonString || '{}');
  };

  const update = (name) => {
    const targetEle = document.querySelector(`.${className}[data-name="${name}"]`);
    if (!targetEle) return;
    const parsedConfig = parse(targetEle.text);
    if (name === 'main') {
      Object.assign(staticConfig, parsedConfig);
    } else {
      variableConfig[name] = parsedConfig;
    }
  };

  update('main');

  window.CONFIG = new Proxy({}, {
    get(overrideConfig, name) {
      let existing;
      if (name in staticConfig) {
        existing = staticConfig[name];
      } else {
        if (!(name in variableConfig)) update(name);
        existing = variableConfig[name];
      }

      let override = overrideConfig[name];
      if (override === undefined && typeof existing === 'object') {
        override = {};
        overrideConfig[name] = override;
      }

      if (typeof override === 'object') {
        return new Proxy({...existing, ...override}, {
          set(target, prop, value) {
            override[prop] = value;
            return true;
          }
        });
      }
      return existing;
    }
  });

  document.addEventListener('pjax:success', () => {
    variableConfig = {};
  });
})();
