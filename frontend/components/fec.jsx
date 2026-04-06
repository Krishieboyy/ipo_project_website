import { useState, useEffect } from "react";




  
export default function FEC() {
  const [form, setForm] = useState({
  issue_size: "",
  offer_price: "",
  qib: "",
  hni: "",
  rii: ""
});
  
const inputFields=[
    {name:"issue_size",placeholder:"Issue Size(Cr)"},
    {name:"offer_price",placeholder:"Offer Price"},
    {name:"qib",placeholder:"QIB"},
    {name:"hni",placeholder:"HNI"},
    {name:"rii",placeholder:"RII"},
]


  const getResponse=async()=>{
    const featuresData={
      "Issue_Size(crores)":Number(form.issue_size),
      "Offer Price":Number(form.offer_price),
      "QIB":Number(form.qib),
      "HNI":Number(form.hni),
      "RII":Number(form.rii)
    }
    const payload={
      features:featuresData
    };
    try{
      const res=await fetch("http://localhost:8001/deep_analysis",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify(payload),
    });
    const data=await res.json();
    if(!res.ok){
      throw new Error(data.detail || "Something went wrong");
    }
    }catch(err){
      console.error(err);
      alert("Could not get response from backend:",err.message);
    }
    

  }

  const inputClass = `
  mt-1 w-full bg-[#0B0E11]/90 text-[#EAECEF]
  px-4 py-3 rounded-2xl border border-[#2B3139]
  hover:border-[#444C56]
  focus:border-[#F0B90B]
  outline-none
`;

  const btnClass = `
  mt-5 py-2 rounded-2xl font-medium text-black
  bg-[#F0B90B]
  hover:bg-[#ffd24d]
  transition
`;

  const cardClass = `
  w-full relative bg-[#111417]/65 backdrop-blur-2xl 
  rounded-3xl p-6 border border-white/10
  overflow-hidden
`;

  const glowLayer1 = `
  absolute inset-0 rounded-3xl pointer-events-none
  bg-gradient-to-b from-white/5 via-transparent to-transparent
`;

  const glowLayer2 = `
  absolute inset-0 rounded-3xl pointer-events-none
  bg-gradient-to-b from-[#F0B90B]/12 via-transparent to-transparent
`;

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
      <div className={`${cardClass} max-w-6xl w-full`}>
        <div className={glowLayer1}></div>
        <div className={glowLayer2}></div>

        <h2 className="text-[#EAECEF] mb-6 text-center md:text-left">
          Deep dive
        </h2>

        {/* MAIN LAYOUT */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center">
          {/* INPUT SECTION */}
          <div className="w-full max-w-sm md:w-[320px]">
            

            <form className="p-4 md:p-6 flex flex-col gap-4">
              {inputFields.map((field, index) => (
                <input
                    key={field.name} 
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={(e) =>
                      setForm({ ...form, [field.name]: e.target.value })
                    }
                    className={inputClass}
                />
                ))}

              <button
                type="button"
                onClick={getResponse}
                
                className={btnClass}
              >
                Get IPO Score
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
