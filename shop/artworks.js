const artworks = [
  {
    title: "Spring Whisper",
    price: "$50",
    image: "images/art1.jpg",
    link: "https://paypal.me/yourlink1",
    soldout: false
  },
  {
    title: "Silent Bloom",
    price: "$70",
    image: "images/art2.jpg",
    link: "https://paypal.me/yourlink2",
    soldout: true
  }
];

const gallery = document.getElementById("gallery");

artworks.forEach(item => {
  const card = document.createElement("div");
  card.className = item.soldout ? "card sold" : "card";

  let buttonHTML = item.soldout
    ? `<div class="soldout">Sold Out</div>`
    : `<a href="${item.link}" class="button" target="_blank">Buy</a>`;

  card.innerHTML = `
  <div class="image-wrap">
    <img src="${item.image}" alt="${item.title}">
  </div>
  <div class="card-content">
    <div class="title">${item.title}</div>
    <div class="price">${item.price}</div>
    ${buttonHTML}
  </div>
`;

  gallery.appendChild(card);
});

// ===== Modal =====
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.querySelector(".close");

// 画像クリックで開く
document.addEventListener("click", function(e) {
  if (e.target.tagName === "IMG") {
    modal.style.display = "block";
    modalImg.src = e.target.src;
  }
});

// 閉じる
closeBtn.onclick = function() {
  modal.style.display = "none";
};

// 背景クリックで閉じる
modal.onclick = function(e) {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};