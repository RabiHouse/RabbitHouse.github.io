const artworks = [
  {
    title: "Rabbitflower Doll#94 [water color]",
    price: "",
    image: "./images/094.jpg",
    link: "",
    soldout: true
  },
  {
    title: "Rabbitflower Doll#93 [water color]",
    price: "",
    image: "./images/093.jpg",
    link: "",
    soldout: true
  },
  {
    title: "Rabbitflower Doll#92 [water color]",
    price: "",
    image: "./images/092.jpg",
    link: "",
    soldout: true
  },
  {
    title: "Rabbitflower Doll#91 [water color]",
    price: "¥6800",
    image: "./images/091.jpg",
    link: "https://www.paypal.com/ncp/payment/CEBVE2U6N9EV2",
    soldout: false
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