import gsap from "gsap";

export function confilm_init() {
  const contaner = document.querySelector(".form_container")!;
  const data = JSON.parse(localStorage.getItem("aube_form_confirm") ?? "{}");

  Object.entries(data).forEach(([key, value]) => {
    const item = document.createElement("div");
    item.className = "form_confirm";
    item.innerHTML = `
    <dt>${key}</dt>
    <dd>${value}</dd>
    <input type='hidden' name=${key} value=${value} />
  `;

    contaner.appendChild(item);
  });
}

export function form_init() {
  const form = document.querySelector<HTMLFormElement>(".form")!;
  if (!form) return;

  const validators = {
    all: (value: string) => value.trim() !== "",
    kana: (value: string) => /^[ァ-ヶー\s　]+$/.test(value.trim()),
    addr: (value: string) => /^\d{3}-?\d{4}$/.test(value.trim()),
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    tel: (value: string) => /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(value.trim()),
  };

  const blocks = form.querySelectorAll(".form_block")!;
  const errors = form.querySelectorAll(".form_block_errorText")!;

  function setError(block: HTMLElement, message: string) {
    const error = block.querySelector(".form_block_errorText")!;
    if (!error) return;
    block.classList.add("--error");
    error.innerHTML = message;
    error.classList.remove("js--none");
  }

  function validateInput(input: HTMLInputElement | HTMLTextAreaElement) {
    const block = input.closest<HTMLElement>(".form_block");
    if (!block) return true;

    const error = block.querySelector<HTMLElement>(".form_block_errorText");
    error?.classList.add("js--none");
    let noError = true;
    const value = input.value.trim();
    const type = input.type;
    const validation = input.dataset.validation;

    if (input.required && value === "") {
      setError(block, `${input.name}を入力してください。`);
      noError = false;
    }

    if (type === "email" && value !== "" && !validators.email(value)) {
      setError(block, "メールアドレスを正しい形式で入力してください。");
      noError = false;
    }

    if (validation === "kana" && value !== "" && !validators.kana(value)) {
      setError(block, "フリガナは全角カタカナで入力してください。");
      noError = false;
    }

    if (validation === "addr" && value !== "" && !validators.addr(value)) {
      setError(block, "郵便番号を正しい形式で入力してください。");
      noError = false;
    }

    if (type === "tel" && value !== "" && !validators.tel(value)) {
      setError(block, "電話番号を正しい形式で入力してください。");
      return false;
    }

    return noError;
  }

  function validateSelect(select: HTMLSelectElement) {
    const block = select.closest<HTMLElement>(".form_block");
    if (!block) return true;
    const error = block.querySelector<HTMLElement>(".form_block_errorText");
    error?.classList.add("js--none");
    let noError = true;

    if (select.required && select.value === "") {
      setError(block, `${select.name}を選択してください。`);
      noError = false;
    }

    return noError;
  }

  function validateFile(input: HTMLInputElement) {
    const block = input.closest<HTMLElement>(".form_block");
    if (!block) return true;
    const error = block.querySelector<HTMLElement>(".form_block_errorText");
    error?.classList.add("js--none");
    let noError = true;

    const file = input.files?.[0];

    if (input.required && !file) {
      setError(block, `${input.name}をアップロードしてください。`);
      noError = false;
    }

    if (file) {
      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        setError(block, `${input.name}はJPG / PNG / WebP形式の画像を選択してください。`);
        noError = false;
      }

      if (file.size > maxSize) {
        setError(block, `${input.name}は5MB以内の画像を選択してください。`);
        noError = false;
      }
    }

    return noError;
  }

  function validateRadioBlock(block: HTMLFieldSetElement) {
    const radios = [...block.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    const checked = radios.some((radio) => radio.checked);
    const error = block.querySelector<HTMLElement>(".form_block_errorText");
    error?.classList.add("js--none");
    let noError = true;

    if (!checked) {
      const legend = block.querySelector("legend")!;
      setError(block, `${legend.innerHTML || ""}を選択してください。`);
      noError = false;
    }

    return noError;
  }

  function validateMailConfirmation() {
    const mail = form.querySelector<HTMLInputElement>("#mail");
    const confirmation = form.querySelector<HTMLInputElement>("#mail_confirmation");

    if (!mail || !confirmation) return true;

    const block = confirmation.closest<HTMLElement>(".form_block");
    if (!block) return true;

    if (mail.value.trim() !== confirmation.value.trim()) {
      setError(block, "メールアドレスが一致していません。");
      return false;
    }

    return true;
  }

  function validateAll() {
    let noError = true;

    form?.querySelectorAll<HTMLInputElement>('input:not([type="radio"]):not([type="file"])').forEach((input) => {
      if (!validateInput(input)) noError = false;
    });

    form?.querySelectorAll<HTMLInputElement>("textarea").forEach((input) => {
      if (!validateInput(input)) noError = false;
    });

    form?.querySelectorAll<HTMLSelectElement>("select").forEach((select) => {
      if (!validateSelect(select)) noError = false;
    });

    form?.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
      if (!validateFile(input)) noError = false;
    });

    form?.querySelectorAll<HTMLFieldSetElement>(".form_block.--radio").forEach((block) => {
      if (!validateRadioBlock(block)) noError = false;
    });

    if (!validateMailConfirmation()) noError = false;

    return noError;
  }

  const form_agree = form.querySelector(".form_agree button")!;
  const submitButtonCover = form.querySelector(".submitButtonCover")!;

  form_agree.addEventListener("click", () => {
    form_agree.classList.toggle("--cheked");
    submitButtonCover.classList.toggle("--notAllow");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (submitButtonCover.classList.contains("--notAllow")) return;

    blocks.forEach((item) => item.classList.remove("--error"));
    errors.forEach((item) => (item.innerHTML = ""));

    if (!validateAll()) {
      gsap.to(form, {
        xPercent: 1,
        yoyo: true,
        repeat: 3,
        duration: 0.05,
        ease: "power1.inOut",
      });
      const firstError = form.querySelector<HTMLElement>(".form_block.--error");
      firstError?.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    } else {
      const formData = new FormData(form);
      const data: Record<string, string> = {};

      formData.forEach((value, key) => {
        if (value instanceof File) return;
        data[key] = value.toString();
      });

      localStorage.setItem("aube_form_confirm", JSON.stringify(data));
      location.href = "/contact/confirm/";
    }
  });

  form.addEventListener("input", (e) => {
    const target = e.target;

    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (target instanceof HTMLInputElement) {
      if (target.type === "file" || target.type === "radio") return;
    }

    validateInput(target);

    if (target instanceof HTMLInputElement) {
      if (target.id === "mail" || target.id === "mail_confirmation") {
        validateMailConfirmation();
      }
    }
  });

  form.addEventListener("change", (e) => {
    const target = e.target;

    if (target instanceof HTMLSelectElement) {
      validateSelect(target);
    }

    if (target instanceof HTMLInputElement && target.type === "file") {
      validateFile(target);
    }

    if (target instanceof HTMLInputElement && target.type === "radio") {
      const block = target.closest<HTMLFieldSetElement>(".form_block.--radio");
      if (block) validateRadioBlock(block);
    }
  });

  const zip = form.addr_1;
  const addr = form.addr_2 as HTMLInputElement;
  if (!zip || !addr) return;

  zip.addEventListener("input", async () => {
    const zipcode = zip.value.replace(/[^\d]/g, "");
    if (zipcode.length !== 7) return;

    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`);
    const data = await res.json();

    if (!data.results) return;

    const result = data.results[0];
    addr.value = `${result.address1} ${result.address2} ${result.address3}`;

    const block = addr.closest<HTMLElement>(".form_block")?.querySelector(".form_block_errorText");
    block?.classList.add("js--none");
  });
}
