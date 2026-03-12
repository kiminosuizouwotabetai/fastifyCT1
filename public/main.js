document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('api-btn');
  
  button.addEventListener('click', async () => {
    try {
      const response = await fetch('/api');
      const text = await response.text();
      
      if (text === 'Запрос прошел успешно') {
        console.log(text);
        alert('Посмотри в консоль');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  });
});