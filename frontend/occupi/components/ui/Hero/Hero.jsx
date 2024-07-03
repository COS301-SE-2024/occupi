import GradientWrapper from "@/components/GradientWrapper"
import Image from "next/image"
import HeroImg from "@/public/images/hero.png"
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
                <div>
                    <div className="space-y-5 max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl bg-clip-text text-transparent bg-gradient-to-r font-extrabold mx-auto sm:text-6xl"
                            style={{
                                backgroundImage: "linear-gradient(179.1deg, #FFFFFF 0.77%, rgba(255, 255, 255, 0) 182.09%)"
                            }}
                        >
                            Predict. Plan. Perfect.
                        </h1>
                        <p className="max-w-xl mx-auto text-gray-300">
                            Gain control of your business's growth with Occupi's comprehensive office analystics, capacity prediction, and ocuppancy prediction platform.
                        </p>
                    </div>
                    <GradientWrapper className="mt-16 sm:mt-28" wrapperClassName="max-w-3xl h-[250px] top-12 inset-0 sm:h-[300px] lg:h-[650px]">
                        <Image
                            src={HeroImg}
                            alt="occupi hero image"
                        />
                    </GradientWrapper>
                </div>
            </LayoutEffect>
        </div>
    </section>
)

export default Hero