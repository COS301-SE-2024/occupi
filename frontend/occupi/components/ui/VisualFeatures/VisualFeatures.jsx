import SectionWrapper from "@/components/SectionWrapper";
import Feature1 from "@/public/images/Illustration-2.svg";
import Feature2 from "@/public/images/Illustration-1.svg";
import Feature3 from "@/public/images/Group.svg";
import AppleStore from "@/public/images/app-store.svg";
import PlayStore from "@/public/images/googleplay.svg";
import Image from "next/image";
import Link from "next/link";

const VisualFeatures = () => {
  const features = [
    {
      title: "Historic office data analysis",
      desc: "Peek into your office's past occupancy data to make informed decisions about your office's future capacity.",
      img: Feature1,
    },

    // {
    //     title: "Make AI-powered predictions for office capacity",
    //     desc: "By participating in Occupi, you're directly contributing to the growth of artificial intelligence. Networks like these are required to train AI models, and AI labs are some of our biggest customers.",
    // },
    {
      title: "What is Occupi and How Does it Work?",
      desc: "AI-powered predicitions based off of historical data enable you to plan and perfect your organizations office management",
      img: Feature2,
    },
  ];
  return (
    <SectionWrapper>
      <div className="custom-screen text-gray-300">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl">
            Take your office capacity to the next level
          </h2>
          <p className="mt-3">
            With Occupi's powerful features, you can easily predict and plan
            your office capacity. You can also analyze your office's occupancy
            and make data-driven decisions to improve your business.
          </p>
        </div>
        <div className="mt-12">
          <ul className="space-y-8 gap-x-6 sm:flex sm:space-y-0">
            {features.map((item, idx) => (
              <li
                className="flex-1 flex flex-col justify-between border border-gray-800 rounded-2xl"
                key={idx}
                style={{
                  background:
                    "radial-gradient(141.61% 141.61% at 29.14% -11.49%, rgba(203, 213, 225, 0.15) 0%, rgba(203, 213, 225, 0) 57.72%)",
                }}
              >
                <div className="p-8">
                  <h3 className="text-gray-50 text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-3 sm:text-sm md:text-base">{item.desc}</p>
                </div>
                <div className="pl-8">
                  <Image
                    src={item.img}
                    className="w-full ml-auto"
                    alt={item.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="custom-screen text-gray-300">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
            Make AI-powered predictions for office capacity
          </h2>
          <p className="mt-3">
            By participating in Occupi, you're directly contributing to the
            growth of artificial intelligence. Networks like these are required
            to train AI models, and AI labs are some of our biggest customers.
          </p>
        </div>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-gray-50 text-4xl font-semibold sm:text-5xl mt-20">
            Join Occupi Today.
          </h2>
          <div className="flex justify-center items-center mt-6 space-x-4 ml-20">
            <Link
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={PlayStore}
                alt="Google Play Store"
                width={235}
                height={40}
                className="cursor-pointer"
              />
            </Link>
            <Link
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={AppleStore}
                alt="Apple App Store"
                width={435}
                height={40}
                className="cursor-pointer"
              />
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default VisualFeatures;
