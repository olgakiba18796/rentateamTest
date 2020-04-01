// Эта функция по идее должна быть импортирована,
// но упрощено и нужно её простейшим образом реализовать
// может вернуть массив вида (null | {v: number})[] или вернуть ошибку класса Error
const serverApiRequest = async a => {
  /*simulate request*/

  try {
    const response = await fetch("//t.syshub.ru" + a);
    if (!response) {
      throw new Error("Request error(error code: " + response.status + ")");
    }
    const data = await response.json();
    return data;
  } catch (e) {
    return e.name + ": " + e.message;
  }
};

// Можно выполнить по аналогии с serverApiRequest(), а можно лучше, см. подсказку ниже
// Не должно прерывать выполнение приложения и ломать его, если что-то пошло не так

const sendAnalytics = (a, b) => {
  /*sendBeacon maybe*/
  const response = navigator.sendBeacon("//t.syshub.ru" + a, b);

  if (response) {
    return "Successfully queued!";
  } else {
    return "Failure.";
  }
};
// window.addEventListener("unload", sendAnalytics, false);
/* Нужно:
    1 Сделать функцию рабочей в принципе не меняя логики но доступно ES8+
    2 Общая логика: запрос, если успех, то отправка данных в аналитику, обработка данных и их возврат
    3 Подсветить места, где ТЗ недостаточно
    4 Подсветить места, вероятно проблемные
*/
const requestData = async ({ id, param }) => {
  // should return [null, {v: 1}, {v: 4}, null] or Error (may return array (null | {v: number})[])
  try {
    const response = await serverApiRequest(
      "/query/data/" + id + "/param/" + param
    );
    if (response.error) {
      throw new Error(response.error);
    }
    sendAnalytics("/requestDone", {
      type: "data",
      id: id,
      param: param
    });
    return response
      .filter(i => i !== null)
      .map(i => Object.values(i))
      .flat();
  } catch (e) {
    return e.name + ": " + e.message;
  }

  // after complete request if *not* Error call

  // магия, описать

  // return array2;
  // return [1, 4]
};

// app proto
// START DO NOT EDIT app
(async () => {
  const log = text => {
    const app = document.querySelector("#app");
    app.appendChild(document.createTextNode(JSON.stringify(text, null, 2)));
    app.appendChild(document.createElement("br"));
  };

  log(await requestData({ id: 1, param: "any" }));
  log(await requestData({ id: 4, param: "string" }));
  log(await requestData({ id: 4, param: 404 }));
})();
// END DO NOT EDIT app
