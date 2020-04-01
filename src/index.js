// Эта функция по идее должна быть импортирована,
// но упрощено и нужно её простейшим образом реализовать
// может вернуть массив вида (null | {v: number})[] или вернуть ошибку класса Error

const serverApiRequest = async a => {
  /*simulate request*/
  try {
    const response = await fetch(`//t.syshub.ru/${a}`); // использование шаблонных строк;
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`${response.status}: ${data.error}`); //обработка ошибок с сервера
    }
    return data;
  } catch (e) {
    return `${e.name} ${e.message}`; //вывод сообщения ошибки
  }
};

// Можно выполнить по аналогии с serverApiRequest(), а можно лучше, см. подсказку ниже
// Не должно прерывать выполнение приложения и ломать его, если что-то пошло не так

const sendAnalytics = async (a, b) => {
  if (navigator.sendBeacon) {
    //проверяем поддержку браузером
    const status = navigator.sendBeacon(a, b); //использование метода sendBeacon
    return status ? "Successfully queued!" : "Failure."; //использование тернарного оператора для обработки ответа}
  }
  const { data } = await axios.post(a, b);
  return data;
};
/* Нужно:
    1 Сделать функцию рабочей в принципе не меняя логики но доступно ES8+
    2 Общая логика: запрос, если успех, то отправка данных в аналитику, обработка данных и их возврат
    3 Подсветить места, где ТЗ недостаточно
    4 Подсветить места, вероятно проблемные
*/
const requestData = async ({ id, param }) => {
  // should return [null, {v: 1}, {v: 4}, null] or Error (may return array (null | {v: number})[])
  try {
    const response = await serverApiRequest(`query/data/${id}/param/${param}`); // использование шаблонных строк;
    if (/Error\b/.test(response)) {
      throw new Error(response);
    }
    sendAnalytics("/requestDone", {
      //вероятно, проблемное место, ответ приходит, но метод был отключен и не может быть использован
      //недостаточно ТЗ: нет API, куда посылается запрос sendAnalytics
      type: "data",
      id, //использование синтаксиса ES6
      param //использование синтаксиса ES6
    });
    return response
      .filter(i => i !== null)
      .map(i => Object.values(i))
      .flat(); //обработка данных;
  } catch (e) {
    return e.message;
  }

  // after complete request if *not* Error call
};

// app proto
// START DO NOT EDIT app
(async () => {
  const log = text => {
    const app = document.querySelector("#app");
    app.appendChild(document.createTextNode(JSON.stringify(text, null, 2)));
    app.appendChild(document.createElement("br"));
  };

  // Для лаконичности кода можно использовать Promise.all
  log(await requestData({ id: 1, param: "any" }));
  log(await requestData({ id: 4, param: "string" }));
  log(await requestData({ id: 4, param: 404 }));
})();
// END DO NOT EDIT app
