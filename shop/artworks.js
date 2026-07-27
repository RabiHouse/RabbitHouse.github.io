const artworks = [
  {
    title: "Rabbitflower Doll#100 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_540/l_watermark_b,fl_relative,w_1.0,h_1.0,c_fill,o_70/ii_wol2qp.png",
    link: "https://ko-fi.com/s/7e21f40667",
    soldout: false
  },

  {
    title: "Rabbitflower Doll#99 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/385264884025-4fb8-8b4f-6210c3a386bd949b8d158d76-48d1-8baa-8e3ecccd1871c5be35c6160a-4edb-846e-f09711906988_t9n2io.webp",
    link: "https://ko-fi.com/s/6b82fa22b1",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#95 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/b9e73da2db58-4f9d-b2d3-0f957faf8510f982cfbfe3de-4b20-87f7-410eec745d02c2c958b28b82-40e9-9ef8-38974be1b33a_nptqo2.webp",
    link: "https://ko-fi.com/s/c1ccc1b8cd",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#94 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/3f7d2fde4847-4acf-8f18-ec1f2e925b1c80002b674768-4419-8354-ada64e5f88d93b6f3e4648ca-4a30-b0e6-fbd9ec5ee97b_mr8xy7.webp",
    link: "https://ko-fi.com/s/1032a6f424",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#93 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/6f5725212a4e-4aec-825d-f268215009a65edb230b73cf-4fc0-ac9f-136813cef23e44472cc7ef25-4045-86a4-0e3b4d32b63f_zshzap.webp",
    link: "https://ko-fi.com/s/78d7b4145a",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#92 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/4b530b7090f2-42e6-899d-3e6b0191f50eb96fa76448ba-478c-a0bf-b18cf705440006c24eceb26b-4ce0-95a8-d1926cb4b0b3_zqsfd5.webp",
    link: "https://ko-fi.com/s/15dc822163",
    soldout: false
  },
  {
    title: "Rabbitflower Doll#91 [water color]",
    image: "https://res.cloudinary.com/dzgxt2s8f/image/upload/c_fill,h_1080/l_watermark_b,fl_relative,w_1.0,o_70/84f1f6c02ac1-48df-8e19-06e909072305f3d01d9b047f-45b1-9a29-d0a6c25281a45005526a4680-4184-87aa-77e64004fce2_ywsdxo.webp",
    link: "https://ko-fi.com/s/1119066fee",
    soldout: false
  }
];

document.addEventListener("DOMContentLoaded", function () {
  const gallery = document.getElementById("gallery");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modal-img");
  const closeBtn = document.querySelector(".close");

  // --- ギャラリー生成 ---
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
        <div class="price">${item.price || ""}</div>
        ${buttonHTML}
      </div>
    `;

    gallery.appendChild(card);
  });

  // --- モーダル処理 ---
  if (modal && modalImg && closeBtn) {
    // 画像クリックで開く
    document.addEventListener("click", function(e) {
      if (e.target.tagName === "IMG" && e.target.closest('.image-wrap')) {
        modal.style.display = "block";
        modalImg.src = e.target.src;
      }
    });

    // 閉じるボタン
    closeBtn.onclick = function() {
      modal.style.display = "none";
    };

    // 背景クリックで閉じる
    modal.onclick = function(e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }
});