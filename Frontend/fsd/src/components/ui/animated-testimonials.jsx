export function AnimatedTestimonials({ testimonials }) {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
        >
          <div className="flex items-center mb-4">
            <img 
              src={testimonial.src} 
              alt={testimonial.name} 
              className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-500"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{testimonial.name}</h3>
              <p className="text-sm text-gray-400">{testimonial.designation}</p>
            </div>
          </div>
          <p className="text-gray-300 italic text-base mb-4">
            "{testimonial.quote}"
          </p>
        </div>
      ))}
    </div>
  );
}

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote: "The attention to detail and innovative features have completely transformed our workflow.",
      name: "Sarah Chen",
      designation: "Product Manager at TechFlow",
      src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560",
    },
    {
      quote: "Implementation was seamless and the results exceeded our expectations.",
      name: "Michael Rodriguez",
      designation: "CTO at InnovateSphere",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540",
    },
  ];
  
  return <AnimatedTestimonials testimonials={testimonials} />;
}
