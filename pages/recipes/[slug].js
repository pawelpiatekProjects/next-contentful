import {createClient} from "contentful";
import Image from 'next/image';
import {documentToReactComponents} from '@contentful/rich-text-react-renderer';

const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY
});

export const getStaticPaths = async () => {
    const response = await client.getEntries({content_type: 'recipe'});

    const paths = response.items.map(item => {
        return {
            params: {
                slug: item.fields.slug
            }
        }
    })

    return {
        paths,
        fallback: false
    }
}

export const getStaticProps = async ({params}) => {
    // Zawsze zwracana jest tablica obiektów
    const {items} = await client.getEntries({
        content_type: 'recipe',
        'fields.slug': params.slug // jakie pole ma pasować (może być każde pole z danego modelu)
    })

    return {
        props: {
            recipe: items[0]
        },
        revalidate: 1 // jak często (najczęściej) next ma sprawdzać dane z backendu i sprawdzać czy coś się zmieniło
        // W tym przypadku jest to raz na 1s
    }
}

export default function RecipeDetails({recipe}) {

    const {featuredImage, title, cookingTime, ingredients, method} = recipe.fields;
    console.log(featuredImage)
    return (
        <div>
            <div className="banner">
                <Image
                    src={`https:${featuredImage.fields.file.url}`}
                    width={featuredImage.fields.file.details.image.width}
                    height={featuredImage.fields.file.details.image.height}
                />
                <h2>{title}</h2>
            </div>
            <div className="info">
                <p>Takes about {cookingTime} mins to cook.</p>
                <h3>Ingredients: </h3>
                {ingredients.map((ingredient, index) => (
                    <span key={index}>{ingredient}</span>
                ))}
            </div>
            <div className="method">
                <h3>Method: </h3>
                <div>{documentToReactComponents(method)}</div>
            </div>

            <style jsx>{`
                 h2,h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
            `}</style>
        </div>
    )
}