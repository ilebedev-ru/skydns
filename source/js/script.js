'use scrict';

;(function() {
  const SELECT_SHOW_ELEM_DESKTOP = 1;
  const SELECT_SHOW_ELEM_MOBILE = 3;

  const LANGS = {
    en: {
      title: 'Form title',
      name: 'first name*:',
      lastname: 'last name*:',
      email: 'email*:',
      company: 'company:',
      city: 'city*:',
      message: 'message*:',
      button: 'Send'
    },
    ru: {
      title: 'Название формы',
      name: 'Имя*:',
      lastname: 'Фамилия*:',
      email: 'Эл. почта*:',
      company: 'Компания:',
      city: 'Город*:',
      message: 'Сообщение:',
      button: 'Отправить'
    },
    ar: {
      title: 'Form title',
      name: 'first name*:',
      lastname: 'last name*:',
      email: 'email*:',
      company: 'company:',
      city: 'city*:',
      message: 'message*:',
      button: 'Send'
    }
  };
  
  const RESULT_MESSAGE_TEXT = {
    en : {
      success: "Data sent successfully",
      error: "Errors received while processing the form"
    },
    ru : {
      success: "Данные формы успешно отправлены",
      error: "При обработке формы получены ошибки"
    },
    ar : {
      success: "AR Data sent successfully",
      error: "AR Errors received while processing the form"
    }
  };

  const FORM_ERROR = {
    en : {
      empty: "The field cannot be empty",
      mailPattern: "Fill in the format xxxx@xxx.xx"
    },
    ru : {
      empty: "Поле не может быть пустым",
      mailPattern: "Заполните поле в формате xxxx@xxx.xx"
    },
    ar : {
      empty: "AR The field cannot be empty",
      mailPattern: "AR Fill in the format xxxx@xxx.xx"
    }
  }

  let activeLang = 'en'; // какой язык активен в данный момент

  let errorStop = false; // флаг остановки отправки формы
  
  const langSelect = document.querySelector('.form__select');
  
  const form = document.querySelector('.form');
  const formArea = form.querySelector('.form__form-area');
  const formTitlesElements = form.querySelectorAll('[id^="lang_"]');
  const formInputs = form.querySelectorAll('.form__input');
  const mailInput = form.querySelector('[name="email"]');
  
  const submitButton = form.querySelector('.form__button');
  let submitCounter = 0;

  // РАСКРЫВАЮЩИЙСЯ СПИСОК (на дестопе показывем 1, на мобиле 3)
  const documentWidth = document.documentElement.clientWidth;
  langSelect.size = (documentWidth < 900) ? SELECT_SHOW_ELEM_MOBILE : SELECT_SHOW_ELEM_DESKTOP;
  
  // СМЕНА ЯЗЫКА
  
  // собрали объект {тайтл: дом-элемент};
  const formTitles = {};
  Array.prototype.forEach.call(formTitlesElements, (elem) => {
    let id = elem.id.split('_')[1];
    formTitles[id] = elem;
  });
  
  // обработчик смены языка
  langSelect.addEventListener('change', () => {
    let id = langSelect.value;
    activeLang = id;
  
    for (let titleName in formTitles) {
      formTitles[titleName].textContent = LANGS[id][titleName];
    };
    
    // смена направления ввода для арабского
    Array.prototype.forEach.call(formInputs, (input) => {
      input.dir = (id === "ar") ? 'rtl' : 'ltr';
      input.style.order = (id === "ar") ? 0 : 2;
      input.parentNode.style.justifyContent = (id === "ar") ? 'flex-end' : 'flex-start';
    });
  });
  
  // ОБРАБОТКА ФОРМЫ
  
  // сообщение об ошибке почты
  let inputError = document.createElement('div');
  inputError.classList.add('form__mail-alert');

  // сообщение о результатах отправки формы
  let resultMessage = document.createElement('p');
  resultMessage.classList.add('form__alert');

  // функция проверки инпутов на пустоту
  function checkEmptyInput(inputs) {
    Array.prototype.forEach.call(inputs, (input, i) => {
      if (input.validity.valueMissing) {
        errorStop = true;

        let earlyErr = Boolean(input.parentNode.querySelector('.form__mail-alert')); // проверка, стоит ли уже ошибка

        if (!earlyErr) {
          // если ранее не было ошибки, то вешаем предупреждение
          input.style.borderColor = 'red';
          let localErr = inputError.cloneNode(true);
          localErr.textContent = FORM_ERROR[activeLang].empty;
          input.parentNode.appendChild(localErr); 
          let onfocusFlag = false;

          input.onfocus = function() {
            // удаление предупреждения при фокусе на поле
            if (!onfocusFlag) {
              input.style.borderColor = 'gray';
              input.parentNode.removeChild(localErr);
              onfocusFlag = true;
            }
          };
        }
      }
    }); 
  };
  
  //функция валидации email
  function checkMail(value) {
    if (!errorStop) {
      let mailErrStop = false;

      // проверка на соответствие паттерну 
      if (mailInput.validity.patternMismatch) {
        
        errorStop = true;
        mailErrStop = true;
        inputError.textContent = FORM_ERROR[activeLang].mailPattern;
        mailInput.parentNode.appendChild(inputError);
      }
  
      mailInput.onfocus = function() {
        if (mailErrStop) {
          mailInput.style.borderColor = 'gray';
          mailInput.parentNode.removeChild(inputError);
          mailErrStop = false;
        }
      };
    }
  };
  
  // обработчик отправки формы
  submitButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    errorStop = false;
    
    checkEmptyInput(formInputs); // проверяем поля на пустоту
    checkMail(mailInput.value); // проверяем email на правильность заполнения
    
    if (errorStop) {
      resultMessage.textContent = RESULT_MESSAGE_TEXT[activeLang].error;
      resultMessage.classList.add('form__alert--error');
    } else {
      if (submitCounter % 2) {
        resultMessage.textContent = RESULT_MESSAGE_TEXT[activeLang].error + ' Причина: каждая вторая отправка';
        resultMessage.classList.add('form__alert--error');
      } else {
        resultMessage.textContent = RESULT_MESSAGE_TEXT[activeLang].success;
        resultMessage.classList.remove('form__alert--error');

        formArea.reset();
      }
      submitCounter++;
    }

      // вставляем сообщение об ошибке или успехе
      form.insertBefore(resultMessage, formArea);
      window.scrollTo(0,0);
  });
})();