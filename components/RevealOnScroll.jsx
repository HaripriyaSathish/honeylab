"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// Every element with class "reveal" fades up when it scrolls into view
export default function RevealOnScroll() {
  useGSAP(() => {
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        clearProps: "transform", // give hover/lift CSS back control after the reveal
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });
  });
  return null;
}
