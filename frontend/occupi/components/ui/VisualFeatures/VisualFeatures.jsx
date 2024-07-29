import SectionWrapper from "@/components/SectionWrapper";
import Feature1 from "@/public/images/Illustration-2.svg";
import Feature2 from "@/public/images/Illustration-1.svg";
import Frame6 from "@/public/images/Frame-6.svg";
import Frame7 from "@/public/images/Frame-7.svg";
import Frame8 from "@/public/images/Frame-4.svg";
import Frame3 from "@/public/images/Frame-3.svg";
import Frame5 from "@/public/images/Frame-5.svg";
import AppleStore from "@/public/images/app-store.svg";
import PlayStore from "@/public/images/googleplay.svg";
import WindowStore from "@/public/images/microsoft-store.svg";
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
          <p className="mt-3 mb-10">
            By participating in Occupi, you're directly contributing to the
            growth of artificial intelligence. By continuously improving
            predictive accuracy, the Occupi system introduces a dynamic,
            data-driven approach to office capacity management, benefiting both
            daily users and office operations.
          </p>
        </div>
      </div>

      <div className="custom-screen text-gray-300">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/2 px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
                Use Occupi Web for your Analytics.
              </h2>
              <p className="mt-3">
                It offers real-time capacity status to employees and visitors,
                and detailed future occupancy predictions to office managers and
                owners, enabling optimized space usage and improved efficiency.
              </p>
            </div>
          </div>
          <div className="pl-8 mt-10">
            <Image
              src={Frame8}
              alt="Occupi App Screenshot"
              width={550}
              height={100}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="custom-screen text-gray-300">
        <div className="flex flex-wrap">
          <div className="pl-8">
            <Image
              src={Frame6}
              alt="Occupi App Screenshot"
              width={550}
              height={100}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="w-full md:w-1/2 px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
                Use Occupi Desktop for more detailed prediction output.
              </h2>
              <p className="mt-3">
                Leveraging historical data and real-time inputs, the system
                helps office managers make informed decisions about space
                utilization, enhancing both immediate and long-term planning.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="custom-screen text-gray-300">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/2 px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
                Who are we?
              </h2>
              <p className="pl-8 mt-12">
                Y2Kode is a team of driven individuals with a passion for
                technology and a commitment to excellence. We are excited about
                the idea behind the Office Capacity Predictor and appreciate the
                freedom to infuse it with our unique Y2Kode twist.
              </p>
            </div>
          </div>
          <div className="pl-8">
            <Image
              src={Frame5}
              alt="Occupi App Screenshot"
              width={550}
              height={100}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="custom-screen text-gray-300">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
            The Occupi Office Capacity Prediction system revolutionizes office
            space management by utilizing advanced machine learning algorithms
            and predictive models.
          </h2>
          <p className="mt-3">
            As Y2Kode, we have developed this innovative solution for mobile for
            everyday office users, as well as a web application, and a desktop
            application for providing managerial services and delivering more
            detailed predictive outputs.
          </p>
          <div className="pl-8">
            <Image
              src={Frame7}
              alt="Occupi App Screenshot"
              width={550}
              height={100}
              className="rounded-lg shadow-lg mt-10"
            />
          </div>
        </div>
      </div>

      <div className="custom-screen text-gray-300">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-full mt-20">
            <Image
              src={Frame3}
              alt="Occupi App Screenshot"
              width={850}
              height={100}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="flex justify-center items-center mt-6 space-x-4 ml-20">
            <Link
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={PlayStore}
                alt="Google Play Store"
                width={335}
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
                width={635}
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
                src={WindowStore}
                alt="Window Store"
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
