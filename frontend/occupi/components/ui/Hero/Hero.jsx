import GradientWrapper from "@/components/GradientWrapper"
import Image from "next/image"
import HeroImg from "@/public/images/Group.svg"
import LayoutEffect from "@/components/LayoutEffect"

const Hero = () => (
    <section>
        <div className="custom-screen py-28">
            <LayoutEffect className="duration-1000 delay-300"
                isInviewState={{
                    trueState: "opacity-1",
                    falseState: "opacity-0"
                }}
            >
                
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <GradientWrapper wrapperClassName="max-w-3xl h-[250px] top-12 inset-0 sm:h-[300px] lg:h-[650px]">
                    <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 md:ml-20">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4 sm:text-5xl">
                            Analyse and Predict your office capacity
                        </h1>
                        <p className="text-xl text-white-600 mb-6">
                            Predict. Plan. Perfect
                        </p>
                        <p className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                            Get Access →
                        </p>
                    </div>
                    </GradientWrapper>
                    
                    {/* <GradientWrapper className="mt-16 sm:mt-28" wrapperClassName="max-w-3xl h-[250px] top-12 inset-0 sm:h-[300px] lg:h-[650px]"> */}
                    <div className="md:w-1/2">
                        <Image
                            src={HeroImg}
                            alt="Occupi App Screenshot"
                            width={350}
                            height={100}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                    {/* </GradientWrapper> */}
                </div>
            </LayoutEffect>
        </div>
        
    </section>
)

export default Hero