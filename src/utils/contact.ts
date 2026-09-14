import gsap from "gsap";

export function contact_init() {
  const form = document.getElementById("form") as HTMLFormElement;
  if (!form) console.error("contact_init");
  const errorEl = form.querySelector("#form_error") as HTMLElement;

  const radios = form.querySelectorAll(".form-group.--radio");
  radios.forEach((item) => {
    const labels = item.querySelectorAll("label");
    labels.forEach((label, clickIdx) => {
      label.addEventListener("click", () => {
        labels.forEach((label, idx) => {
          if (clickIdx === idx) label.classList.add("--current");
          else label.classList.remove("--current");
        });
      });
    });
  });

  form.addEventListener("submit", (e) => {
    let hasError = false;
    errorEl.innerHTML = "";
    const errTexts = [];

    const requirement = document.querySelector<HTMLInputElement>('input[name="requirement"]:checked');
    if (!requirement) {
      errTexts.push("お問い合わせの要件を選択してください");
      hasError = true;
    }

    const company = form.company;
    if (!company.value.trim()) {
      errTexts.push("会社名を入力してください");
      hasError = true;
    }

    const name = form.username;
    if (!name.value.trim()) {
      errTexts.push("お名前を入力してください");
      hasError = true;
    }

    const email = form.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      errTexts.push("メールアドレスを入力してください");
      hasError = true;
    } else if (!emailPattern.test(email.value)) {
      errTexts.push("メールアドレスの形式をご確認ください");
      hasError = true;
    }

    const referrer = form.referrer;
    if (!referrer.value) {
      errTexts.push("弊社を知ったきっかけを選択してください");
      hasError = true;
    }

    const message = form.message;
    if (!message.value.trim()) {
      errTexts.push("メッセージを入力してください");
      hasError = true;
    }

    if (hasError) {
      e.preventDefault();
      errorEl.classList.add("--hasError");
      errTexts.forEach((t) => {
        const p = document.createElement("p");
        p.innerText = t;
        errorEl.appendChild(p);
      });
      gsap.to(form, {
        xPercent: 1,
        yoyo: true,
        repeat: 3,
        duration: 0.05,
        ease: "power1.inOut",
      });
    } else {
      // const formData = new FormData(form);
      // const data = Object.fromEntries(formData);
      // sessionStorage.setItem("resync_formMain", JSON.stringify(data));
      // window.location.href = "/contact/confirmation";
    }
  });
}

export function contactWhitepaper_init() {
  const form = document.getElementById("form") as HTMLFormElement;
  if (!form) console.error("contact_init");
  const errorEl = form.querySelector("#form_error") as HTMLElement;

  form.addEventListener("submit", (e) => {
    let hasError = false;
    errorEl.innerHTML = "";
    const errTexts = [];

    const company = form.company;
    if (!company.value.trim()) {
      errTexts.push("会社名を入力してください");
      hasError = true;
    }

    const name = form.username;
    if (!name.value.trim()) {
      errTexts.push("お名前を入力してください");
      hasError = true;
    }

    const email = form.email;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
      errTexts.push("メールアドレスを入力してください");
      hasError = true;
    } else if (!emailPattern.test(email.value)) {
      errTexts.push("メールアドレスの形式をご確認ください");
      hasError = true;
    }

    const referrer = form.referrer;
    if (!referrer.value) {
      errTexts.push("弊社を知ったきっかけを選択してください");
      hasError = true;
    }

    if (hasError) {
      e.preventDefault();

      errorEl.classList.add("--hasError");
      errTexts.forEach((t) => {
        const p = document.createElement("p");
        p.innerText = t;
        errorEl.appendChild(p);
      });
      gsap.to(form, {
        xPercent: 1,
        yoyo: true,
        repeat: 3,
        duration: 0.05,
        ease: "power1.inOut",
      });
    }
  });
}

export function contactConfirmation_init() {
  // const data = sessionStorage.getItem("resync_formMain");
  // if (!data) return;
  // const json = JSON.parse(data);
  // const form_requirement = document.getElementById("form_requirement")!;
  // form_requirement.textContent = json.requirement;
  // const form_company = document.getElementById("form_company")!;
  // form_company.textContent = json.company;
  // const form_username = document.getElementById("form_username")!;
  // form_username.textContent = json.username;
  // const form_tel = document.getElementById("form_tel")!;
  // form_tel.textContent = json.tel;
  // const form_email = document.getElementById("form_email")!;
  // form_email.textContent = json.email;
  // const form_referrer = document.getElementById("form_referrer")!;
  // form_referrer.textContent = json.referrer;
  // const form_message = document.getElementById("form_message")!;
  // form_message.textContent = json.message;
  // document.getElementById("submit")?.addEventListener("click", async () => {
  //   await fetch("/api/contact", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  // });
  // window.location.href = "/contact/thanks";
}
