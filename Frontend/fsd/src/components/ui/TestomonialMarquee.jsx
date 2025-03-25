// "use client";
// import React from "react";
// import { motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { PinContainer } from "./PinContainer";
// import { GridLineHorizontal, GridLineVertical } from "./GridLines";

// export const TestimonialMarquee = ({ testimonials, className }) => {
//   // Split testimonials into columns
//   const columns = 4;
//   const chunkSize = Math.ceil(testimonials.length / columns);
//   const chunks = Array.from({ length: columns }, (_, colIndex) => {
//     const start = colIndex * chunkSize;
//     return testimonials.slice(start, start + chunkSize);
//   });

//   return (
//     <div className={cn("py-20 bg-black", className)}>
//       <div className="container mx-auto px-4">
//         <h2 className="text-4xl font-bold text-center mb-16 text-white">
//           What Our Users Say
//         </h2>
//         <div className="flex size-full items-center justify-center">
//           <div className="size-[1720px] shrink-0 scale-50 sm:scale-75 lg:scale-100">
//             <div
//               style={{
//                 transform: "rotateX(55deg) rotateY(0deg) rotateZ(-45deg)",
//               }}
//               className="relative top-96 right-[50%] grid size-full origin-top-left grid-cols-4 gap-8 transform-3d"
//             >
//               {chunks.map((column, colIndex) => (
//                 <motion.div
//                   key={colIndex}
//                   animate={{ y: colIndex % 2 === 0 ? 100 : -100 }}
//                   transition={{
//                     duration: colIndex % 2 === 0 ? 10 : 15,
//                     repeat: Infinity,
//                     repeatType: "reverse",
//                   }}
//                   className="flex flex-col items-start gap-8"
//                 >
//                   <GridLineVertical className="-left-4" offset="80px" />
//                   {column.map((testimonial, index) => (
//                     <div className="relative" key={index}>
//                       <GridLineHorizontal className="-top-4" offset="20px" />
//                       <PinContainer 
//                         title={testimonial.role} 
//                         href="#"
//                         className="hover:z-50"
//                       >
//                         <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 w-[20rem] h-[20rem]">
//                           <h3 className="max-w-xs !pb-2 !m-0 font-bold text-xl text-white">
//                             {testimonial.name}
//                           </h3>
//                           <div className="text-base !m-0 !p-0 font-normal">
//                             <span className="text-slate-400">
//                               {testimonial.description}
//                             </span>
//                           </div>
//                           <div
//                             className={`flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br ${testimonial.gradientFrom} ${testimonial.gradientVia} ${testimonial.gradientTo}`} 
//                           />
//                         </div>
//                       </PinContainer>
//                     </div>
//                   ))}
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };