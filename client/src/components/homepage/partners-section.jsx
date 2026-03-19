import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";

// Partner logos - In a real app, replace these with actual partner logos
const partners = [
  {
    id: 1,
    name: "Partner 1",
    logo: "https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/311233586_100458516205775_829673169199024332_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=FxXNU3lHnOkQ7kNvwEXZeFl&_nc_oc=AdkZ2-kkKeRqcyChPfN6jT6mhncIgY6Z0UbsDE-vAUO87hVovJnwm2_OE1pHm03JBiQ&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=ITRhx7Kj8olXbz4dBWBs5w&oh=00_AfIs-yM6ggT1NRBxw6SiizN0UsUXjWqE2Oy1HY5GbnJ60Q&oe=683D4C73",
  },
  {
    id: 2,
    name: "Partner 2",
    logo: "https://www.fondation-aba.org/wp-content/uploads/2023/01/cropped-Logo-Faba-300x168.png",
  },
  {
    id: 3,
    name: "Partner 3",
    logo: "https://scontent.ftun1-2.fna.fbcdn.net/v/t1.6435-9/75328828_10157757140978390_2987486011652571136_n.png?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=JYxqhwCgAdUQ7kNvwE5vlBH&_nc_oc=AdnfnzJh9qSJ9d2wakgm-Z1oHdPxEV25l6Smxa5lh2ZX8JRWnm_jxk_kOP-x_xjQ2GY&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=XlJcH-0P5jI-kTyk2wuT_w&oh=00_AfKljK89qTQFfdcqEAh8WMgANg-6idREqPw95SHliNCyQA&oe=685EF820",
  },
  {
    id: 4,
    name: "Partner 4",
    logo: "https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/261462945_1284980908646756_8074796074526547359_n.png?stp=dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=2YoLZPBYj3cQ7kNvwFcZFOo&_nc_oc=AdnnilFIHs9zgCBt1h--HMs9ooqqMdWR-dMeRRu4xkO2mcvP2VPakd5k4CEi8FczU2Y&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=HjIN89uGBRfzprLQGRfSPw&oh=00_AfKjC8lCpTXdn0pWdK4iRZenlhRVDZHiqukwNh8QUMPGcA&oe=683D5F3E",
  },
  {
    id: 5,
    name: "Partner 1",
    logo: "https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/311233586_100458516205775_829673169199024332_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=FxXNU3lHnOkQ7kNvwEXZeFl&_nc_oc=AdkZ2-kkKeRqcyChPfN6jT6mhncIgY6Z0UbsDE-vAUO87hVovJnwm2_OE1pHm03JBiQ&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=ITRhx7Kj8olXbz4dBWBs5w&oh=00_AfIs-yM6ggT1NRBxw6SiizN0UsUXjWqE2Oy1HY5GbnJ60Q&oe=683D4C73",
  },
  {
    id: 6,
    name: "Partner 2",
    logo: "https://www.fondation-aba.org/wp-content/uploads/2023/01/cropped-Logo-Faba-300x168.png",
  },
  {
    id: 7,
    name: "Partner 3",
    logo: "https://scontent.ftun1-2.fna.fbcdn.net/v/t1.6435-9/75328828_10157757140978390_2987486011652571136_n.png?_nc_cat=103&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=JYxqhwCgAdUQ7kNvwE5vlBH&_nc_oc=AdnfnzJh9qSJ9d2wakgm-Z1oHdPxEV25l6Smxa5lh2ZX8JRWnm_jxk_kOP-x_xjQ2GY&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=XlJcH-0P5jI-kTyk2wuT_w&oh=00_AfKljK89qTQFfdcqEAh8WMgANg-6idREqPw95SHliNCyQA&oe=685EF820",
  },
  {
    id: 8,
    name: "Partner 4",
    logo: "https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-6/261462945_1284980908646756_8074796074526547359_n.png?stp=dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=2YoLZPBYj3cQ7kNvwFcZFOo&_nc_oc=AdnnilFIHs9zgCBt1h--HMs9ooqqMdWR-dMeRRu4xkO2mcvP2VPakd5k4CEi8FczU2Y&_nc_zt=23&_nc_ht=scontent.ftun1-2.fna&_nc_gid=HjIN89uGBRfzprLQGRfSPw&oh=00_AfKjC8lCpTXdn0pWdK4iRZenlhRVDZHiqukwNh8QUMPGcA&oe=683D5F3E",
  },
];

export default function PartnersSlider() {
  return (
    <section id="partners" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos Partenaires
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nous collaborons avec des organisations de premier plan pour offrir
            les meilleures opportunités
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {partners.map((partner) => (
                <CarouselItem
                  key={partner.id}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"
                >
                  <div className="p-2 h-32 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-20 max-w-full transition-all duration-300"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
