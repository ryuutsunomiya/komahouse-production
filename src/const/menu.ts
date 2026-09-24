import { accommodationContent, legalContent, petContent, teamContent } from "./terms";

export const toTop = {
  title: "Top",
  href: "/",
};
export const toConcept = {
  title: "Concept",
  href: "/#concept",
};
export const toFacility = {
  title: "Facility",
  href: "/#facility",
};
export const toAccess = {
  title: "Access",
  href: "/#access",
};
export const toFaq = {
  title: "Faq",
  href: "/#faq",
};

// export const toPrivacy = {
//   title: "プライバシーポリシー",
//   titleEn: "Privacy Policy",
//   id: "privacy",
//   href: "/terms-policies/#privacy",
//   isBlank: false,
//   content: privacyContent,
// };
export const toLegal = {
  index: "1",
  title: "特定商取引",
  titleEn: "Specified Commercial Transactions Act",
  id: "legal",
  href: "/terms-policies/#legal",
  isBlank: false,
  content: legalContent,
};
export const toTeam = {
  index: "2",
  title: "利用規約",
  titleEn: "Terms of Use",
  id: "team",
  href: "/terms-policies/#team",
  isBlank: false,
  content: teamContent,
};
export const toPet = {
  index: "2 - 1",
  title: "ペット同伴規約",
  titleEn: null,
  id: "pet",
  href: "/terms-policies/#pet",
  isBlank: false,
  content: petContent,
};
export const toAccommodation = {
  index: "3",
  title: "宿泊約款",
  titleEn: "Accommodation Terms and Conditions",
  id: "accommodation",
  href: "/terms-policies/#accommodation",
  isBlank: false,
  content: accommodationContent,
};

export const toYoutube = {
  title: "Youtube",
  href: "https://www.youtube.com/@koma-house",
  isBlank: true,
};
export const toInstagram = {
  title: "Instagram",
  href: "https://www.instagram.com/komahouse_/",
  isBlank: true,
};

export const menuData_main = [toTop, toConcept, toFacility, toAccess, toFaq];
export const menuData_sub = [toLegal, toTeam, toPet, toAccommodation];
export const menuData_Follow = [toYoutube, toInstagram];

export const toReserve = "/";
