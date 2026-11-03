(function(){
  var b=document.getElementById('burger'),n=document.getElementById('nav');
  b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
  n.addEventListener('click',function(e){if(e.target.tagName==='A'){n.classList.remove('open');b.setAttribute('aria-expanded','false')}});
  var f=document.getElementById('form'),s=document.getElementById('status');
  var btns=document.querySelectorAll('[data-model]');
  for(var i=0;i<btns.length;i++){btns[i].addEventListener('click',function(){f.msg.value='Интересует: '+this.getAttribute('data-model')+'. Количество: '})}
  f.addEventListener('submit',function(e){
    e.preventDefault();var bad=false;
    ['name','phone'].forEach(function(k){f[k].classList.remove('err')});
    if(f.name.value.replace(/\s/g,'').length<2){f.name.classList.add('err');bad=true}
    if(f.phone.value.replace(/\D/g,'').length<10){f.phone.classList.add('err');bad=true}
    if(!f.agree.checked)bad=true;
    s.className='status '+(bad?'bad':'ok');
    s.textContent=bad?'Проверьте имя, телефон и согласие на обработку данных.':'Прототип: данные никуда не отправлены. Проверка полей пройдена.';
  });
})();
