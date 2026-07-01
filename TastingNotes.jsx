import React, { useState, useEffect, useRef } from "react";

const TastingNotes = () => {
  const [dishes, setDishes] = useState([]);
  const [currentDish, setCurrentDish] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const index = JSON.parse(localStorage.getItem("tn3-dish-index") || "[]");
    const loaded = index.map(id => {
      const data = localStorage.getItem(`tn3-dish:${id}`);
      return data ? JSON.parse(data) : null;
    }).filter(Boolean);
    setDishes(loaded);
  }, []);

  const saveDish = () => {
    if (!currentDish?.dishName?.trim()) return alert("요리 이름을 입력하세요!");

    const newDish = { ...currentDish, id: currentDish.id || Date.now().toString(), updatedAt: Date.now() };

    localStorage.setItem(`tn3-dish:${newDish.id}`, JSON.stringify(newDish));

    let index = JSON.parse(localStorage.getItem("tn3-dish-index") || "[]");
    if (!index.includes(newDish.id)) index.push(newDish.id);
    localStorage.setItem("tn3-dish-index", JSON.stringify(index));

    setDishes(prev => [...prev.filter(d => d.id !== newDish.id), newDish]);
    alert("✅ 저장 완료!");
    setCurrentDish(null);
  };

  const addPhotos = async (e) => {
    const files = Array.from(e.target.files);
    const compressed = await Promise.all(files.map(file => compressImage(file)));
    setCurrentDish(prev => ({ ...prev, photos: [...(prev?.photos || []), ...compressed] }));
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, 800 / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => {
    setCurrentDish(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  };

  const openNew = () => setCurrentDish({ dishName: "", recipe: "", comment: "", photos: [] });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">🍳 테이스팅 노트</h1>

      <button onClick={openNew} className="bg-orange-600 text-white px-6 py-3 rounded-xl mb-6">새 요리 만들기</button>

      {currentDish && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-2xl mb-6">새 요리 기록</h2>
            
            <input
              type="text"
              placeholder="요리 이름"
              value={currentDish.dishName || ""}
              onChange={e => setCurrentDish({...currentDish, dishName: e.target.value})}
              className="w-full p-4 border rounded-2xl mb-4"
            />

            <textarea
              placeholder="레시피"
              value={currentDish.recipe || ""}
              onChange={e => setCurrentDish({...currentDish, recipe: e.target.value})}
              className="w-full p-4 border rounded-2xl mb-4 h-32"
            />

            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={addPhotos}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full border-2 border-dashed border-gray-300 p-12 rounded-2xl hover:border-orange-500"
              >
                📷 사진 추가 (여러장 OK)
              </button>
            </div>

            {currentDish.photos && currentDish.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {currentDish.photos.map((photo, i) => (
                  <div key={i} className="relative">
                    <img src={photo} className="rounded-2xl w-full aspect-square object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">삭제</button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              placeholder="테이스팅 후기"
              value={currentDish.comment || ""}
              onChange={e => setCurrentDish({...currentDish, comment: e.target.value})}
              className="w-full p-4 border rounded-2xl h-32 mb-6"
            />

            <div className="flex gap-4">
              <button onClick={() => setCurrentDish(null)} className="flex-1 py-4 border rounded-2xl">취소</button>
              <button onClick={saveDish} className="flex-1 py-4 bg-orange-600 text-white rounded-2xl">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TastingNotes;
