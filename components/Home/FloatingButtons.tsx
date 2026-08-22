// components/FloatingButtons.tsx
'use client';

export default function FloatingButtons() {
  return (
    <>
      <a
        href="https://wa.me/18005550199"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-7 right-7 w-14 h-14 rounded-full bg-[#25d366] flex items-center justify-center text-2xl shadow-2xl z-[200] hover:bg-[#1ebe5b] transition-colors"
        title="Chat on WhatsApp"
      >
        💬
      </a>
    </>
  );
}