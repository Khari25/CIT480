const searchBtn = document.getElementById("search-btn");
const resultsDiv = document.getElementById("results");

searchBtn.addEventListener("click", () => {
  const query = document.getElementById("prompt").value.trim();

  if (!query) {
    alert("Please type a movie description first!");
    return;
  }

  // Placeholder for now (we’ll add real movie fetching soon)
  resultsDiv.innerHTML = `
    <div style="grid-column: 1 / -1; text-align:center;">
      <h3 style="color:#ff7b7b;">Searching for: "${query}"</h3>
      <p style="color:#bbb; margin-top:0.5rem;">(Your movie results will appear here soon!)</p>
    </div>
  `;
});
