(function(root){
  const transforms=new Set(['v','width','height','w','h','quality','q','format','crop']);
  function imageKey(value){
    if(typeof value!=='string'||!value.trim())return '';
    try{
      const url=new URL(value,'https://catalog.invalid/');
      url.hash='';
      for(const key of [...url.searchParams.keys()])if(transforms.has(key.toLowerCase()))url.searchParams.delete(key);
      url.searchParams.sort();
      return url.href;
    }catch{return value.trim()}
  }
  function uniqueGallery(images){
    const seen=new Set();
    return (Array.isArray(images)?images:[]).filter(src=>{const key=imageKey(src);if(!key||seen.has(key))return false;seen.add(key);return true});
  }
  const api={imageKey,uniqueGallery};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CLEMedia=api;
})(typeof window==='undefined'?globalThis:window);
