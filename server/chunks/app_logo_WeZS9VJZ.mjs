const app_logo = new Proxy({"src":"/_astro/app_logo.PiypGQyD.png","width":1536,"height":335,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/home/runner/work/fanpickems/fanpickems/src/assets/app_logo.png";
							}
							
							return target[name];
						}
					});

export { app_logo as a };
